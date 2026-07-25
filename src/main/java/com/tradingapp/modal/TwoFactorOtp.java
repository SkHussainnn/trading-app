package com.tradingapp.modal;


import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.Data;
import org.springframework.boot.jackson.autoconfigure.JacksonProperties;

@Entity
@Data
public class TwoFactorOtp {

    @Id

    private String id;

    private  String otp;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @OneToOne
    private User user;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)

    private  String jwt;
}
