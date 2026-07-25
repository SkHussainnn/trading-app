package com.tradingapp.service;

import com.tradingapp.modal.TwoFactorOtp;
import com.tradingapp.modal.User;

public interface TwoFactorOtpService {

    TwoFactorOtp createTwoFactorOtp(User user, String otp, String jwt);

    TwoFactorOtp findByUser(Long userId);

    TwoFactorOtp findById(String id);

    boolean verifyTwoFactorOtp(TwoFactorOtp twoFactorOtp, String otp);

    void deleteTwoFactorOtp(TwoFactorOtp twoFactorOtp);
}
