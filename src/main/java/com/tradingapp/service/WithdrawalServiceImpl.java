package com.tradingapp.service;

import com.tradingapp.modal.User;
import com.tradingapp.modal.Withdrawal;

import java.util.List;

public class WithdrawalServiceImpl implements WithdrawalService{
    @Override
    public Withdrawal requestWithdrawal(Long amount, User user) {
        return null;
    }

    @Override
    public Withdrawal proceedWithdrawal(Long withdrawalId, boolean accept) {
        return null;
    }

    @Override
    public List<Withdrawal> getUserWithdrawalHistory(User user) {
        return List.of();
    }

    @Override
    public List<Withdrawal> getAllWithdrawalRequest() {
        return List.of();
    }
}
