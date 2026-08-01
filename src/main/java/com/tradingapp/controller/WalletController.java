package com.tradingapp.controller;

import com.tradingapp.modal.Order;
import com.tradingapp.modal.User;
import com.tradingapp.modal.Wallet;
import com.tradingapp.modal.WalletTransaction;
import com.tradingapp.service.UserService;
import com.tradingapp.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @Autowired
    private UserService userService;

    @GetMapping("/api/wallet")
    public ResponseEntity<Wallet> getUserWallet(@RequestHeader("Authorization") String jwt) throws Exception {
        User user=userService.findUserProfileJwt(jwt);

        Wallet wallet=walletService.getUserWallet(user);

        return new ResponseEntity<>(wallet, HttpStatus.ACCEPTED);

    }

    @PutMapping("/api/wallet/{walletId}/transfer")
    public ResponseEntity<Wallet> walletToWalletTransfer(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long walletId,
            @RequestBody WalletTransaction req
            ) throws Exception {
        User senderUser=userService.findUserProfileJwt(jwt);
        Wallet receiverWallet=walletService.findWalletById(walletId);
        Wallet wallet=walletService.walletToWalletTransfer(
                senderUser, receiverWallet,
                req.getAmount() );

        return new ResponseEntity<>(wallet, HttpStatus.ACCEPTED);
    }

    @PutMapping("/api/wallet/order/{orderId}/pay")
    public ResponseEntity<Wallet> payOrderPayment(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long orderId
    ) throws Exception {
        User user=userService.findUserProfileJwt(jwt);

        Order order = orderService.getOrderById(orderId);

        Wallet wallet=walletService.payOrderPayment(order, user);


        return new ResponseEntity<>(wallet, HttpStatus.ACCEPTED);
    }
}
