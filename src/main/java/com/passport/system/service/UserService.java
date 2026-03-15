package com.passport.system.service;

import com.passport.system.model.Applicant;
import com.passport.system.model.User;
import com.passport.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerApplicant(Applicant applicant) {
        Optional<User> existing = userRepository.findByEmail(applicant.getEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        applicant.setRole("APPLICANT");
        return userRepository.save(applicant);
    }

    public User createStaff(User user) {
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            return existing.get();
        }
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user.get();
        }
        throw new RuntimeException("Invalid email or password");
    }
}
