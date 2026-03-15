package com.passport.system.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "passport_officers")
public class PassportOfficer extends User {
    private String officerBadge;

    public String getOfficerBadge() { return officerBadge; }
    public void setOfficerBadge(String officerBadge) { this.officerBadge = officerBadge; }
}
