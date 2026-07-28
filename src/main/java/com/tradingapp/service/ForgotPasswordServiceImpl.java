package com.tradingapp.service;

import com.tradingapp.domain.VerificationType;
import com.tradingapp.modal.ForgotPasswordToken;
import com.tradingapp.modal.User;
import com.tradingapp.repository.ForgotPasswordRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

public class ForgotPasswordServiceImpl implements ForgotPasswordService{

    @Autowired
    private ForgotPasswordRepository forgotPasswordRepository;

    @Override
    public ForgotPasswordToken createToken(User user,
                                           String id,
                                           String otp,
                                           VerificationType verificationType,
                                           String sendTo) {

        ForgotPasswordToken token= new ForgotPasswordToken();

        token.setUser(user);
        token.setSendTo(sendTo);
        token.setVerificationType(verificationType);
        token.setId(otp);
        token.setId(id);
        return forgotPasswordRepository.save(token);
    }

    @Override
    public ForgotPasswordToken findById(String id) {

        Optional<ForgotPasswordToken> token=forgotPasswordRepository.findById(id);
        return token.orElse(null);
    }

    @Override
    public ForgotPasswordToken findByUser(Long userId) {
        return forgotPasswordRepository.findByUserId(userId);
    }

    @Override
    public void deleteToken(ForgotPasswordToken token) {
        forgotPasswordRepository.delete(token);

    }
}
