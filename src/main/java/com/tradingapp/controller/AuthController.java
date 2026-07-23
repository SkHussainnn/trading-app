package com.tradingapp.controller;

import com.tradingapp.config.JwtProvider;
import com.tradingapp.modal.User;
import com.tradingapp.repository.UserRepository;
import com.tradingapp.responce.AuthResponce;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponce> register(@RequestBody User user) throws Exception {
        User isEmailExit=userRepository.findByEmail(user.getEmail());

        if (isEmailExit!=null){
            throw new Exception("email is already used with another account");
        }
        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setPassword(user.getPassword());
        newUser.setEmail(user.getEmail());
        newUser.setFullname(user.getFullname());

        User savedUser = userRepository.save(newUser);

        Authentication auth = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                user.getPassword()
        );

        SecurityContextHolder.getContext().setAuthentication(auth);

        String jwt= JwtProvider.generateToken(auth);

        AuthResponce res=new AuthResponce();
        res.setJwt(jwt);
        res.setStatus(true);
        res.setMessage("register success");


        return new ResponseEntity<>(res, HttpStatus.CREATED);

    }
}
