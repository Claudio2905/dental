package com.dental.appointment.controller;

import com.dental.appointment.model.Appointment;
import com.dental.appointment.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    // Definir la zona horaria de Perú
    private static final ZoneId PERU_ZONE = ZoneId.of("America/Lima");

    @Autowired
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(id);
        return appointment.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        Appointment savedAppointment = appointmentService.saveAppointment(appointment);
        return new ResponseEntity<>(savedAppointment, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody Appointment appointment) {
        Optional<Appointment> existingAppointment = appointmentService.getAppointmentById(id);
        
        if (existingAppointment.isPresent()) {
            appointment.setId(id);
            Appointment updatedAppointment = appointmentService.saveAppointment(appointment);
            return new ResponseEntity<>(updatedAppointment, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteAppointment(@PathVariable Long id) {
        try {
            appointmentService.deleteAppointment(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        // Asegurarse de que la fecha se interprete en la zona horaria de Perú
        List<Appointment> appointments = appointmentService.getAppointmentsByDate(date);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDni(@PathVariable String dni) {
        List<Appointment> appointments = appointmentService.getAppointmentsByDni(dni);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
}
