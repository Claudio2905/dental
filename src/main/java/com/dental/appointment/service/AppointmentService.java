package com.dental.appointment.service;

import com.dental.appointment.model.Appointment;
import com.dental.appointment.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    public Appointment saveAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDateOrderByAppointmentTimeAsc(date);
    }

    public List<Appointment> getAppointmentsByDni(String dni) {
        return appointmentRepository.findByDniOrderByAppointmentDateDescAppointmentTimeDesc(dni);
    }
}
