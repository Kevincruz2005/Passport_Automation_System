package com.passport.system.controller;

import com.passport.system.model.Appointment;
import com.passport.system.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    /**
     * Schedule an appointment.
     * Body: { "applicationId": 1, "appointmentDateTime": "2025-05-10T10:30:00", "notes": "..." }
     */
    @PostMapping
    public ResponseEntity<?> schedule(@RequestBody Map<String, Object> payload) {
        try {
            Long applicationId = Long.valueOf(payload.get("applicationId").toString());
            LocalDateTime dateTime = LocalDateTime.parse(payload.get("appointmentDateTime").toString());
            String notes = payload.containsKey("notes") ? payload.get("notes").toString() : null;

            Appointment appt = appointmentService.scheduleAppointment(applicationId, dateTime, notes);
            return ResponseEntity.ok(appt);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Get all appointments for an application.
     */
    @GetMapping("/{applicationId}")
    public ResponseEntity<List<Appointment>> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByApplication(applicationId));
    }
}
