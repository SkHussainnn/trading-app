package com.tradingapp.responce;


import lombok.Data;

@Data
public class AuthResponce {

    private String jwt;
    private boolean status;
    private String message;
    private boolean isTwoFactorAuthEnabled;
    private String session;
}
