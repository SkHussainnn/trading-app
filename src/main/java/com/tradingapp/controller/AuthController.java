package com.tradingapp.controller;

import com.tradingapp.config.JwtProvider;
import com.tradingapp.modal.TwoFactorOTP;
import com.tradingapp.modal.User;
import com.tradingapp.repository.UserRepository;
import com.tradingapp.responce.AuthResponce;
import com.tradingapp.service.CustomUserDetailsService;
import com.tradingapp.service.EmailService;
import com.tradingapp.service.TwoFactorOtpService;
import com.tradingapp.service.WatchlistService;
import com.tradingapp.utils.OtpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private TwoFactorOtpService twoFactorOtpService;

    @Autowired
    private WatchlistService watchlistService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponce> register(@RequestBody User user) throws Exception {
        User isEmailExit = userRepository.findByEmail(user.getEmail());

        if (isEmailExit != null) {
            throw new Exception("email is already used with another account");
        }
        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setPassword(user.getPassword());
        newUser.setFullName(user.getFullName());

        User savedUser = userRepository.save(newUser);

        watchlistService.createWatchlist(savedUser);

        Authentication auth = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                user.getPassword()
        );

        SecurityContextHolder.getContext().setAuthentication(auth);

        String jwt = JwtProvider.generateToken(auth);

        AuthResponce res = new AuthResponce();
        res.setJwt(jwt);
        res.setStatus(true);
        res.setMessage("register success");

        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    /**
     * Sign-in flow:
     * 1. Validate username + password
     * 2. Always send OTP to registered email (mandatory 2FA for all accounts)
     * 3. Frontend uses the returned session ID to verify OTP via /two-factor/otp/{otp}
     */
    @PostMapping("/signin")
    public ResponseEntity<AuthResponce> login(@RequestBody User user) throws Exception {

        String userName = user.getEmail();
        String password = user.getPassword();

        Authentication auth = authenticate(userName, password);

        SecurityContextHolder.getContext().setAuthentication(auth);

        String jwt = JwtProvider.generateToken(auth);

        User authUser = userRepository.findByEmail(userName);

        // ── Mandatory 2FA: always require OTP for every sign-in ──
        AuthResponce res = new AuthResponce();
        res.setMessage("Two factor authentication required");
        res.setTwoFactorAuthEnabled(true);

        String otp = OtpUtils.generateOTP();

        // Clear any existing OTP for this user
        TwoFactorOTP oldTwoFactorOTP = twoFactorOtpService.findByUser(authUser.getId());
        if (oldTwoFactorOTP != null) {
            twoFactorOtpService.deleteTwoFactorOtp(oldTwoFactorOTP);
        }

        // Create new OTP record and email it
        TwoFactorOTP newTwoFactorOTP = twoFactorOtpService.createTwoFactorOtp(authUser, otp, jwt);

        // ── Send OTP via email ──
        // If SMTP is not configured, OTP is printed to backend console so you can test manually
        try {
            emailService.sendVerificationOtpEmail(userName, otp);
            System.out.println("[2FA] OTP email sent to: " + userName);
        } catch (Exception e) {
            System.err.println("╔══════════════════════════════════════════════════╗");
            System.err.println("║  [2FA] EMAIL FAILED — SMTP not configured yet    ║");
            System.err.println("║  User  : " + userName);
            System.err.println("║  OTP   : " + otp + "   ← use this to login now      ║");
            System.err.println("║  Error : " + e.getMessage());
            System.err.println("╚══════════════════════════════════════════════════╝");
        }

        res.setSession(newTwoFactorOTP.getId());
        return new ResponseEntity<>(res, HttpStatus.ACCEPTED);
    }

    private Authentication authenticate(String username, String password) {

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

        if (userDetails == null) {
            throw new BadCredentialsException("invalid username");
        }
        if (!password.equals(userDetails.getPassword())) {
            throw new BadCredentialsException("invalid password");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, password, userDetails.getAuthorities());
    }

    /**
     * Verify the OTP entered by the user.
     * On success, returns the real JWT so the frontend can log in.
     */
    @PostMapping("/two-factor/otp/{otp}")
    public ResponseEntity<AuthResponce> verifySigningOtp(
            @PathVariable String otp,
            @RequestParam String id) throws Exception {

        TwoFactorOTP twoFactorOTP = twoFactorOtpService.findById(id);

        if (twoFactorOTP == null) {
            throw new Exception("Invalid or expired session. Please sign in again.");
        }

        if (twoFactorOtpService.verifyTwoFactorOtp(twoFactorOTP, otp)) {
            // Delete used OTP
            twoFactorOtpService.deleteTwoFactorOtp(twoFactorOTP);

            AuthResponce res = new AuthResponce();
            res.setMessage("Two factor authentication verified");
            res.setTwoFactorAuthEnabled(true);
            res.setStatus(true);
            res.setJwt(twoFactorOTP.getJwt());
            return new ResponseEntity<>(res, HttpStatus.OK);
        }
        throw new Exception("Invalid OTP code. Please try again.");
    }
}
