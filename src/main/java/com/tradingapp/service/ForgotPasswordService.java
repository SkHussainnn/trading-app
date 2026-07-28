package com.tradingapp.service;

import com.tradingapp.domain.VerificationType;
import com.tradingapp.modal.ForgotPasswordToken;
import com.tradingapp.modal.User;

public interface ForgotPasswordService {

    ForgotPasswordToken createToken(User user,
                                    String id, String otp,
                                    VerificationType verificationType,
                                    String sendTo);
    ForgotPasswordToken findById(String id);

    ForgotPasswordToken findByUser(Long userId);

    void deleteToken(ForgotPasswordToken token);
}
