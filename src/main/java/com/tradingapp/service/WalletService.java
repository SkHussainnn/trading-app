package com.tradingapp.service;

import com.tradingapp.modal.Order;
import com.tradingapp.modal.User;
import com.tradingapp.modal.Wallet;

public interface WalletService {

    Wallet getUserWallet(User user);
    Wallet addBalance(Wallet wallet, Long money);
    Wallet findWalletById(Long id) throws Exception;
    Wallet walletToWalletTransfer(User sender, Wallet recieverWallet, Long amount) throws Exception;
    Wallet payOrderPayment(Order order, User user) throws Exception;
    Wallet withdrawBalance(Wallet wallet, Long money) throws Exception;
}
