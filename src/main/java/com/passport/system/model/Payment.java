package com.passport.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentID;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    private PassportApplication application;

    private Double amount;
    private String status; // SUCCESS, FAILED
    private LocalDateTime date;

    public Long getPaymentID() { return paymentID; }
    public void setPaymentID(Long paymentID) { this.paymentID = paymentID; }

    public PassportApplication getApplication() { return application; }
    public void setApplication(PassportApplication application) { this.application = application; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
}
