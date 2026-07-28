package com.tradingapp.request;

import com.tradingapp.domain.VerificationType;
import lombok.Data;

@Data
public class ForgotPasswordTokenRequest {

    private String sendTo;

    private VerificationType verificationType;
}
