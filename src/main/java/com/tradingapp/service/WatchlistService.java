package com.tradingapp.service;

import com.tradingapp.modal.Coin;
import com.tradingapp.modal.User;
import com.tradingapp.modal.Watchlist;

public interface WatchlistService {

    Watchlist findUserWatchlist(Long userId) throws Exception;
    Watchlist createWatchlist(User user);
    Watchlist findById(Long id) throws Exception;

    Coin addItemToWatchlist(Coin coin, User user) throws Exception;
}
