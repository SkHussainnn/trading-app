package com.tradingapp.modal;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.tradingapp.domain.USER_ROLE;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Generated;

@Entity
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String fullname;
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Embedded
    private TwoFactorAuth twoFactorAuth=new TwoFactorAuth();
    private USER_ROLE role= USER_ROLE.ROLE_CUSTOMER;

}
