package com.passport.system.config;

import com.passport.system.model.PassportOfficer;
import com.passport.system.model.User;
import com.passport.system.service.UserService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Autowired
    private UserService userService;

    @PostConstruct
    public void seedUsers() {
        // Seed Passport Officer
        PassportOfficer officer = new PassportOfficer();
        officer.setEmail("rajiv@passport.gov.in");
        officer.setPassword("officer123");
        officer.setName("Rajiv Sharma");
        officer.setRole("PASSPORT_OFFICER");
        officer.setOfficerBadge("PO-1001");
        userService.createStaff(officer);

        // Seed Police Officer
        User police = new User();
        police.setEmail("arjun@police.gov.in");
        police.setPassword("police123");
        police.setName("Arjun Singh");
        police.setRole("POLICE_OFFICER");
        userService.createStaff(police);

        // Seed Admin
        User admin = new User();
        admin.setEmail("admin@passport.gov.in");
        admin.setPassword("admin123");
        admin.setName("System Admin");
        admin.setRole("ADMIN");
        userService.createStaff(admin);
    }
}
