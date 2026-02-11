
function submitForm(event) {
    event.preventDefault(); 

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const count = document.getElementById('count').value;
    const date = document.getElementById('date').value;

    
    if (!name.trim()) {
        alert("Please enter a valid name.");
        return;
    }
    if (!phone.trim()) {
        alert("Please enter a valid phone number.");
        return;
    }

    const formData = {
        name: name,
        phoneNumber: phone,
        count: count,
        date: date,
        message: document.getElementById('message').value
    };

    console.log("Submitting Booking:", formData);

    
    fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(async response => {
            if (response.ok) {
                
                showPopup("Booking Successful! ");
                document.getElementById('bookingForm').reset();
            } else {
                const errorMsg = await response.text();
                alert("Failed to submit: " + errorMsg);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Server not found. Please ensure backend is running.");
        });
}


function showPopup(message) {
    let popup = document.createElement('div');
    popup.className = 'success-popup';
    popup.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${message}`;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 3000); 
}


function fetchBookings() {
    fetch('http://localhost:8080/api/bookings')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#bookingsTable tbody');
            const noMsg = document.getElementById('noBookingsMsg');

            tableBody.innerHTML = ''; 

            if (data.length === 0) {
                noMsg.style.display = 'block';
                return;
            }
            noMsg.style.display = 'none';

            data.forEach(booking => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${booking.name}</td>
                <td>${booking.phoneNumber || '-'}</td>
                <td>${booking.count}</td>
                <td>${booking.date}</td>
                <td>${booking.message || '-'}</td>
                <td>
                    <button class="delete-btn" onclick="deleteBooking(${booking.id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching bookings:', error));
}


function deleteBooking(id) {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    fetch(`http://localhost:8080/api/bookings/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                fetchBookings(); 
            } else {
                alert("Failed to delete booking.");
            }
        })
        .catch(error => console.error('Error deleting booking:', error));
}
