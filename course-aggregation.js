let courses = [
    {
        id: 1,
        title: "Introduction to JavaScript",
        videoUrl: "https://www.youtube.com/embed/your_video_id_1",
        description: "Learn the basics of JavaScript, the programming language of the web.",
        language: "English",
        likes: 0,
        dislikes: 0,
        saved: false,
        instructor: "John Doe",
        watchCount: 0
    },
    {
        id: 2,
        title: "Advanced CSS Techniques",
        videoUrl: "https://www.youtube.com/embed/your_video_id_2",
        description: "Take your CSS skills to the next level with advanced techniques.",
        language: "English",
        likes: 0,
        dislikes: 0,
        saved: false,
        instructor: "Jane Doe",
        watchCount: 0
    },
    {
        id: 3,
        title: "JavaScript Basics in Urdu",
        videoUrl: "https://www.youtube.com/embed/your_video_id_3",
        description: "A comprehensive guide to JavaScript in Urdu.",
        language: "Urdu",
        likes: 0,
        dislikes: 0,
        saved: false,
        instructor: "Ahmed Ali",
        watchCount: 0
    },
    {
        id: 4,
        title: "CSS for Beginners in Hindi",
        videoUrl: "https://www.youtube.com/embed/your_video_id_4",
        description: "Learn CSS from scratch in Hindi.",
        language: "Hindi",
        likes: 0,
        dislikes: 0,
        saved: false,
        instructor: "Rahul Kumar",
        watchCount: 0
    }
]; // Initialize an array to store courses
let currentUserId = 1; // Replace with actual user ID

function loadCourses() {
    const courseList = document.getElementById('course-list');
    courseList.innerHTML = '';

    courses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        courseItem.innerHTML = `
            <iframe src="${course.videoUrl}" allowfullscreen></iframe>
            <h2>${course.title}</h2>
            <p>Instructor: ${course.instructor}</p>
            <p>Watched: ${course.watchCount} times | Likes: ${course.likes}</p>
        `;
        courseList.appendChild(courseItem);
    });
}

function likeCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.likes++;
        document.getElementById(`likes-${courseId}`).innerText = course.likes;

        // Send like to server
        fetch('/api/user-interaction', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: currentUserId, courseId: courseId, liked: true })
        });
    }
}

function dislikeCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.dislikes++;
        document.getElementById(`dislikes-${courseId}`).innerText = course.dislikes;

        // Send dislike to server
        fetch('/api/user-interaction', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: currentUserId, courseId: courseId, disliked: true })
        });
    }
}

function saveCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.saved = !course.saved;
        const saveButton = document.querySelector(`button[onclick="saveCourse(${courseId})"]`);
        saveButton.innerText = course.saved ? 'Unsave' : 'Save';

        // Send save to server
        fetch('/api/user-interaction', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: currentUserId, courseId: courseId, saved: course.saved })
        });
    }
}

loadCourses();
