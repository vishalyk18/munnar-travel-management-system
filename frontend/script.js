
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


    fetch('http://localhost:8080/api/booking', {
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

    // Trigger animation
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);

    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 400);
    }, 3000);
}


function fetchBookings() {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
        showLogin();
        return;
    }

    fetch('http://localhost:8080/api/bookings', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => {
            if (response.status === 401) {
                adminLogout();
                throw new Error("Unauthorized");
            }
            return response.json();
        })
        .then(data => {
            showDashboard();
            const tableBody = document.querySelector('#bookingsTable tbody');
            const noMsg = document.getElementById('noBookingsMsg');

            tableBody.innerHTML = '';

             const bookings = data.content;
            if (!bookings || bookings.length === 0) {
                noMsg.style.display = 'block';
                return;
            }
            noMsg.style.display = 'none';

            bookings.forEach(booking => {
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

    const token = sessionStorage.getItem('adminToken');
    
    fetch(`http://localhost:8080/api/booking/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => {
            if (response.ok) {
                fetchBookings();
            } else if (response.status === 401) {
                adminLogout();
            } else {
                alert("Failed to delete booking.");
            }
        })
        .catch(error => console.error('Error deleting booking:', error));
}

// Authentication Logic
function adminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    fetch('http://localhost:8080/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            alert("Invalid credentials!");
            throw new Error("Invalid credentials");
        }
        return response.json();
    })
    .then(data => {
        if (data.token) {
            sessionStorage.setItem('adminToken', data.token);
            fetchBookings();
        }
    })
    .catch(error => console.error(error));
}

function adminLogout() {
    sessionStorage.removeItem('adminToken');
    showLogin();
}

function checkAuth() {
    if(document.getElementById('loginContainer')) {
        const token = sessionStorage.getItem('adminToken');
        if (token) {
            fetchBookings();
        } else {
            showLogin();
        }
    }
}

function showLogin() {
    const loginContainer = document.getElementById('loginContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    if(loginContainer && dashboardContainer) {
        loginContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
        document.getElementById('bookingsTable').getElementsByTagName('tbody')[0].innerHTML = '';
    }
}

function showDashboard() {
    const loginContainer = document.getElementById('loginContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    if(loginContainer && dashboardContainer) {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
    }
}

// UI Animations Initialization
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up').forEach(el => {
        observer.observe(el);
    });

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Modal Close on Outside Click
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('exploreModal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // Directions Toggle
    const showDirectionsBtn = document.getElementById('showDirectionsBtn');
    const directionsSection = document.getElementById('directionsSection');
    if (showDirectionsBtn && directionsSection) {
        showDirectionsBtn.addEventListener('click', () => {
            directionsSection.classList.toggle('active-show');
            if (directionsSection.classList.contains('active-show')) {
                directionsSection.scrollIntoView({ behavior: 'smooth' });
                // Re-trigger reveal animations for items inside
                document.querySelectorAll('#directionsSection .reveal-up').forEach(el => {
                    el.classList.add('active');
                });
            }
        });
    }

    // FAQ Accordion Toggle
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.onclick = function() {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current FAQ item
            if (!isActive) {
                item.classList.add('active');
            }
        };
    });
});

// Modal Logic
const parkData = {
    'eravikulam': {
        title: 'Eravikulam National Park',
        description: 'Experience the pristine beauty of the Western Ghats. Known for the endangered Nilgiri Tahr and the blooming of the Neelakurinji flowers.',
        reviews: [
            { author: 'Rahul Gupta', stars: 5, text: 'Absolutely mesmerizing! We spotted several Nilgiri Tahrs right next to the walkway.' },
            { author: 'Meera S', stars: 4, text: 'Beautiful rolling hills. Make sure to book tickets online in advance to avoid long queues.' }
        ],
        qa: [
            { q: 'What is the best time to visit?', a: 'Early morning is best to avoid the crowd and get clear views before the mist rolls in.' },
            { q: 'Is it accessible for elderly people?', a: 'Yes, safari buses take you to the top, and the pathways are relatively flat and well-maintained.' }
        ]
    },
    'mattupettydam': {
        title: 'Mattupetty Dam',
        description: 'A storage concrete gravity dam known for its beautiful lake and speedboat rides. The surrounding shola forests are ideal for trekking and bird watching.',
        reviews: [
            { author: 'Vikram Singh', stars: 5, text: 'The speedboat ride was thrilling! The view of the tea gardens from the water is stunning.' },
            { author: 'Anjali P', stars: 4, text: 'Great place for a family picnic. We even saw a few wild elephants near the shore.' }
        ],
        qa: [
            { q: 'What are the boating charges?', a: 'Around ₹500 for a 15-minute speedboat ride (up to 5 people) and ₹300 for ordinary boating.' },
            { q: 'Is there any entry fee?', a: 'A small entry fee of about ₹10 per adult is applicable.' }
        ]
    },
    'kolukkumalai': {
        title: 'Kolukkumalai Tea Estate',
        description: 'The highest tea plantation in the world, offering an adventurous 4x4 jeep safari and breathtaking sunrise views over the Ghats.',
        reviews: [
            { author: 'Chris M', stars: 5, text: 'The jeep ride is bumpy but the destination is heaven! Best sunrise I have ever seen.' },
            { author: 'Santhosh Kumar', stars: 5, text: 'The tea factory tour is very interesting. They still use traditional methods from the 1930s.' }
        ],
        qa: [
            { q: 'How do I reach there?', a: 'It is accessible only by 4x4 jeeps which can be hired from Munnar or Suryanelli.' },
            { q: 'Is it suitable for children?', a: 'The jeep ride is quite rough, so it might be challenging for very young children or elderly people.' }
        ]
    },
    'topstation': {
        title: 'Top Station',
        description: 'The highest point in Munnar, providing a 360-degree view of the Western Ghats and the Theni district valley in Tamil Nadu.',
        reviews: [
            { author: 'David Wilson', stars: 5, text: 'Felt like walking above the clouds! The panoramic views are just unbelievable.' },
            { author: 'Priya Mani', stars: 4, text: 'Wear comfortable shoes as there is some walking involved. The morning views are the best.' }
        ],
        qa: [
            { q: 'Is there an entry fee?', a: 'Entry to the general area is free, but some specific viewpoints might have a small platform fee of ₹20-₹25.' },
            { q: 'What happened to the railway station?', a: 'It was destroyed in the Great Flood of 1924, but the name "Top Station" remains as a tribute.' }
        ]
    },
    'attukal': {
        title: 'Attukal Waterfalls',
        description: 'A majestic waterfall located between Munnar and Pallivasal, surrounded by rolling hills and dense forests. Perfect for trekking and photography.',
        reviews: [
            { author: 'Arjun K', stars: 5, text: 'The roar of the water and the mist in the air is magical. A must-visit during monsoon!' },
            { author: 'Smita R', stars: 4, text: 'The road is a bit narrow, but the waterfall view makes it worth it. Great spot for trekking.' }
        ],
        qa: [
            { q: 'Is there an entry fee?', a: 'No, there is no entry fee to visit Attukal Waterfalls.' },
            { q: 'Can we swim in the pool below?', a: 'It is possible, but be very careful of slippery rocks and sharp edges.' }
        ]
    },
    'kundala': {
        title: 'Kundala Lake',
        description: 'Home to Asia\'s first arch dam, this lake offers serene Shikara boat rides and is surrounded by cherry blossoms and Kurinji flowers.',
        reviews: [
            { author: 'John Doe', stars: 5, text: 'The Shikara ride reminded me of Dal Lake. Very peaceful and less crowded than Mattupetty.' },
            { author: 'Sneha Rao', stars: 4, text: 'The golf course nearby is also beautiful. Perfect place for a quiet evening walk.' }
        ],
        qa: [
            { q: 'What boating options are available?', a: 'You can choose from pedal boats, rowboats, and Kashmiri-style Shikara boats.' },
            { q: 'When do the Kurinji flowers bloom?', a: 'The Neelakurinji flowers bloom once every 12 years, covering the hills in purple.' }
        ]
    },
    'blossom': {
        title: 'Blossom Park',
        description: 'A vibrant 16-acre park featuring rare trees, flower beds, artificial waterfalls, and adventure activities like cycling and roller skating.',
        reviews: [
            { author: 'Amit Shah', stars: 5, text: 'Perfect for kids! My children loved the play area and the fish aquarium.' },
            { author: 'Lata M', stars: 4, text: 'Beautiful landscaping. The flower show in March-April is a treat for nature lovers.' }
        ],
        qa: [
            { q: 'What are the park timings?', a: 'The park is open daily from 9:00 AM to 7:00 PM.' },
            { q: 'Are there any entry rules?', a: 'It is a plastic-free zone. Please avoid littering and do not pluck the flowers.' }
        ]
    }
};

function openModal(placeId) {
    const modal = document.getElementById('exploreModal');
    const modalBody = document.getElementById('modalBody');
    const data = parkData[placeId];

    if (data) {
        let reviewsHtml = data.reviews.map(r => `
            <div class="review-card">
                <div class="stars">${'<i class="fa-solid fa-star"></i>'.repeat(r.stars)}</div>
                <div class="author">${r.author}</div>
                <div class="text">"${r.text}"</div>
            </div>
        `).join('');

        let qaHtml = data.qa.map(qa => `
            <div class="qa-card">
                <div class="qa-question">Q: ${qa.q}</div>
                <div class="qa-answer">A: ${qa.a}</div>
            </div>
        `).join('');

        modalBody.innerHTML = `
            <div class="modal-header">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>
            <div class="modal-body-section">
                <h3><i class="fa-regular fa-comment"></i> Top Reviews</h3>
                ${reviewsHtml}
            </div>
            <div class="modal-body-section">
                <h3><i class="fa-solid fa-circle-question"></i> Questions & Answers</h3>
                ${qaHtml}
            </div>
        `;
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal() {
    const modal = document.getElementById('exploreModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}
