package com.tradingapp.controller;

import com.tradingapp.modal.User;
import com.tradingapp.modal.Wallet;
import com.tradingapp.modal.Withdrawal;
import com.tradingapp.service.TransactionService;
import com.tradingapp.service.UserService;
import com.tradingapp.service.WalletService;
import com.tradingapp.service.WithdrawalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class WithdrawalController {

    @Autowired
    private WithdrawalService withdrawalService;

    @Autowired
    private WalletService walletService;

    @Autowired
    private UserService userService;

    @Autowired
    private TransactionService transactionService;


    // =========================================================
    // WITHDRAWAL REQUEST
    // =========================================================

    @PostMapping("/api/withdrawal/{amount}")
    public ResponseEntity<?> withdrawalRequest(
            @PathVariable Long amount,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {

        User user =
                userService.findUserProfileByJwt(jwt);

        Wallet userWallet =
                walletService.getUserWallet(user);


        // Create withdrawal request
        Withdrawal withdrawal =
                withdrawalService.requestWithdrawal(
                        amount,
                        user
                );


        // Deduct money from wallet
        // This will also create WITHDRAWAL transaction
        walletService.withdrawBalance(
                userWallet,
                withdrawal.getAmount()
        );


        return new ResponseEntity<>(
                withdrawal,
                HttpStatus.OK
        );
    }


    // =========================================================
    // ADMIN PROCESS WITHDRAWAL
    // =========================================================

    @PostMapping("/api/admin/withdrawal/{id}/proceed/{accept}")
    public ResponseEntity<?> proceedWithdrawal(
            @PathVariable Long id,
            @PathVariable boolean accept,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {

        User user =
                userService.findUserProfileByJwt(jwt);


        Withdrawal withdrawal =
                withdrawalService.proceedWithdrawal(
                        id,
                        accept
                );


        // If admin declines withdrawal,
        // return money to user's wallet
        if (!accept) {

            Wallet userWallet =
                    walletService.getUserWallet(
                            withdrawal.getUser()
                    );

            walletService.addBalance(
                    userWallet,
                    withdrawal.getAmount()
            );
        }


        return new ResponseEntity<>(
                withdrawal,
                HttpStatus.OK
        );
    }


    // =========================================================
    // USER WITHDRAWAL HISTORY
    // =========================================================

    @GetMapping("/api/withdrawal")
    public ResponseEntity<List<Withdrawal>> getWithdrawalHistory(
            @RequestHeader("Authorization") String jwt
    ) throws Exception {

        User user =
                userService.findUserProfileByJwt(jwt);


        List<Withdrawal> withdrawals =
                withdrawalService.getUserWithdrawalHistory(
                        user
                );


        return new ResponseEntity<>(
                withdrawals,
                HttpStatus.OK
        );
    }


    // =========================================================
    // ADMIN - ALL WITHDRAWAL REQUESTS
    // =========================================================

    @GetMapping("/api/admin/withdrawal")
    public ResponseEntity<List<Withdrawal>> getAllWithdrawalRequest(
            @RequestHeader("Authorization") String jwt
    ) throws Exception {

        User user =
                userService.findUserProfileByJwt(jwt);


        List<Withdrawal> withdrawals =
                withdrawalService.getAllWithdrawalRequest();


        return new ResponseEntity<>(
                withdrawals,
                HttpStatus.OK
        );
    }
}