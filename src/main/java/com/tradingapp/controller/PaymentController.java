package com.tradingapp.controller;

import com.razorpay.RazorpayException;
import com.stripe.exception.StripeException;
import com.tradingapp.domain.PaymentMethod;
import com.tradingapp.modal.PaymentOrder;
import com.tradingapp.modal.User;
import com.tradingapp.responce.PaymentResponse;
import com.tradingapp.service.PaymentService;
import com.tradingapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PaymentController {

    @Autowired
    private UserService userService;

    @Autowired
    private PaymentService paymentService;

@PostMapping("/api/payment/{paymentMethod}/amount/{amount}")
    public ResponseEntity<PaymentResponse> paymnetHandler(
        @PathVariable PaymentMethod paymentMethod,
        @PathVariable Long amount,
        @RequestHeader("Authorization") String jwt) throws Exception,
        RazorpayException,
        StripeException {

    User user = userService.findUserProfileByJwt(jwt);

    PaymentResponse paymentResponse;

    PaymentOrder order = paymentService.createOrder(user, amount, paymentMethod);

    if (paymentMethod.equals(PaymentMethod.RAZORPAY)) {
        paymentResponse = paymentService.createRazorpayPaymentLink(user, amount);
    }
    else {
        paymentResponse = paymentService.createStripePaymentLink(user, amount, order.getId());
    }
    return new ResponseEntity<>(paymentResponse, HttpStatus.CREATED);
}



}
