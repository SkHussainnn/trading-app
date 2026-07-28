package com.tradingapp.service;

import com.tradingapp.domain.VerificationType;
import com.tradingapp.modal.User;
import com.tradingapp.modal.VerificationCode;

public interface VerificationCodeService {

    VerificationCode sendVerificationCode(User user, VerificationType verificationType);

    VerificationCode getVerificationCodeById(Long id) throws Exception;

    VerificationCode getVerificationCodeByUser(Long userId);

    void deleteVerificationCodeById(VerificationCode verificationCode);
}
