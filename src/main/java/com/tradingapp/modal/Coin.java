package com.tradingapp.modal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
public class Coin {

    @Id
    @JsonProperty("id")
    private String id;

    @JsonProperty("symbol")
    private String symbol;

    @JsonProperty("name")
    private String name;

    @JsonProperty("image")
    private String image;

    @JsonProperty("current_price")
    private double currentPrice = 0.0;

    @JsonProperty("market_cap")
    private long marketCap = 0L;

    @JsonProperty("market_cap_rank")
    private int marketCapRank = 0;

    @JsonProperty("fully_diluted_valuation")
    private long fullyDilutedValuation = 0L;

    @Column(nullable = true)
    @JsonProperty("total_volume")
    private Long totalVolume = 0L;

    @JsonProperty("high_24h")
    private double high24h = 0.0;

    @JsonProperty("low_24h")
    private double low24h = 0.0;

    @Column(nullable = true)
    @JsonProperty("price_change_24h")
    private Double priceChange24h = 0.0;

    @Column(nullable = true)
    @JsonProperty("price_change_percentage_24h")
    private Double priceChangePercentage24h = 0.0;

    @Column(nullable = true)
    @JsonProperty("market_cap_change_24h")
    private Double marketCapChange24h = 0.0;

    @Column(nullable = true)
    @JsonProperty("market_cap_change_percentage_24h")
    private Double marketCapChangePercentage24h = 0.0;

    @JsonProperty("circulating_supply")
    private long circulatingSupply = 0L;

    @Column(nullable = true)
    @JsonProperty("total_supply")
    private Long totalSupply = 0L;

    @Column(nullable = true)
    @JsonProperty("max_supply")
    private Long maxSupply = 0L;

    @JsonProperty("ath")
    private double ath = 0.0;

    @JsonProperty("ath_change_percentage")
    private double athChangePercentage = 0.0;

    @JsonProperty("ath_date")
    private Date athDate;

    @JsonProperty("atl")
    private double atl = 0.0;

    @JsonProperty("atl_change_percentage")
    private double atlChangePercentage = 0.0;

    @JsonProperty("atl_date")
    private Date atlDate;

    @JsonProperty("roi")
    @JsonIgnore
    private String roi;

    @JsonProperty("last_updated")
    private Date lastUpdated;

    @PrePersist
    @PreUpdate
    public void ensureNonNullFields() {
        if (totalVolume == null) totalVolume = 0L;
        if (priceChange24h == null) priceChange24h = 0.0;
        if (priceChangePercentage24h == null) priceChangePercentage24h = 0.0;
        if (marketCapChange24h == null) marketCapChange24h = 0.0;
        if (marketCapChangePercentage24h == null) marketCapChangePercentage24h = 0.0;
        if (totalSupply == null) totalSupply = 0L;
        if (maxSupply == null) maxSupply = 0L;
        if (lastUpdated == null) lastUpdated = new Date();
    }
}
