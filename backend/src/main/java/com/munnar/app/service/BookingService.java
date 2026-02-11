package com.munnar.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.munnar.app.model.Booking;
import com.munnar.app.repository.BookingRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    public List<String> getPlaces() {
        return List.of(
                "Eravikulam National Park",
                "Mattupetty Dam",
                "Kolukkumalai Tea Estate",
                "Top Station",
                "Attukal Waterfalls",
                "Kundala Lake",
                "Blossom Park");
    }
}
