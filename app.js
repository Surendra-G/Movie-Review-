// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAnfK_lDP5jv5j_u3HrsrzCqp9-SGtS3-8",
    authDomain: "workshop-bd6ac.firebaseapp.com",
    projectId: "workshop-bd6ac",
    storageBucket: "workshop-bd6ac.appspot.com",
    messagingSenderId: "1075517070994",
    appId: "1:1075517070994:web:2a88f7ad8b76cea37fd04b",
    measurementId: "G-4QKGRFRHHB"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to add a new movie
async function addNewMovie() {
    const title = document.getElementById('titleInput').value.trim();
    const director = document.getElementById('directorInput').value.trim();
    const releaseDate = document.getElementById('releaseInput').value.trim();
    const rating = parseFloat(document.getElementById('rating').value.trim());

    // Validate input values
    if (!title || !director || !releaseDate || isNaN(rating) || rating < 0 || rating > 5) {
        alert('Please enter valid values for all fields.');
        return;
    }

    try {
        await addDoc(collection(db, "MovieApp"), {
            title: title,
            director: director,
            releaseDate: releaseDate,
            rating: rating
        });
        console.log("Movie added successfully!");
        // Reset input fields
        document.getElementById('titleInput').value = '';
        document.getElementById('directorInput').value = '';
        document.getElementById('releaseInput').value = '';
        document.getElementById('rating').value = '';
    } catch (error) {
        console.error("Error adding movie: ", error);
        alert("An error occurred while adding the movie. Please try again later.");
    }
}

// Function to delete a movie
async function deleteMovie(movieId) {
    try {
        await deleteDoc(doc(db, "MovieApp", movieId));
        console.log("Movie deleted successfully!");
    } catch (error) {
        console.error("Error deleting movie: ", error);
        alert("An error occurred while deleting the movie. Please try again later.");
    }
}

// Function to edit a movie
async function editMovie(movieId, movieData) {
    document.getElementById('titleInput').value = movieData.title;
    document.getElementById('directorInput').value = movieData.director;
    document.getElementById('releaseInput').value = movieData.releaseDate;
    document.getElementById('rating').value = movieData.rating;

    // Change button text and functionality to "Update"
    const btn = document.getElementById('btn');
    btn.textContent = 'Update';
    btn.removeEventListener('click', addNewMovie);
    btn.addEventListener('click', () => updateMovie(movieId));
}

// Function to update a movie
async function updateMovie(movieId) {
    const title = document.getElementById('titleInput').value.trim();
    const director = document.getElementById('directorInput').value.trim();
    const releaseDate = document.getElementById('releaseInput').value.trim();
    const rating = parseFloat(document.getElementById('rating').value.trim());

    if (isNaN(rating) || rating < 0 || rating > 5) {
        alert('Rating must be a number between 0 and 5.');
        return;
    }

    try {
        await updateDoc(doc(db, "MovieApp", movieId), {
            title: title,
            director: director,
            releaseDate: releaseDate,
            rating: rating
        });

        // Reset input fields and button text/functionality
        document.getElementById('titleInput').value = '';
        document.getElementById('directorInput').value = '';
        document.getElementById('releaseInput').value = '';
        document.getElementById('rating').value = '';
        const btn = document.getElementById('btn');
        btn.textContent = 'Add Movie';
        btn.removeEventListener('click', updateMovie);
        btn.addEventListener('click', addNewMovie);
        console.log("Movie updated successfully!");
    } catch (error) {
        console.error("Error updating movie: ", error);
        alert("An error occurred while updating the movie. Please try again later.");
    }
}

// Query Firestore to get MovieApp and display them
const movieList = document.getElementById('movieList');

function displayMovieList(movies) {
    const tableBody = document.getElementById('movieList');
    tableBody.innerHTML = '';

    movies.forEach((movie) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${movie.title}</td>
            <td>${movie.director}</td>
            <td>${movie.releaseDate}</td>
            <td>${movie.rating}</td>
            <td>
            <button class="edit-btn" data-movie-id="${movie.id}" data-movie='${JSON.stringify(movie)}'>Edit</button>
                <button class="delete-btn" data-movie-id="${movie.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

        // Add event listeners to edit and delete buttons after they are created
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const movieData = JSON.parse(event.target.dataset.movie); // Parse JSON string to object
            editMovie(movieData.id, movieData);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const movieId = event.target.dataset.movieId;
            deleteMovie(movieId);
        });
    });
}

// Function to sort MovieApp by a specific field
function sortMovieList(field) {
    const q = query(collection(db, "MovieApp"), orderBy(field));
    onSnapshot(q, (snapshot) => {
        const movies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        displayMovieList(movies);
    });
}

// Function to handle sorting with input
function handleSortingWithInput(field) {
    const inputPrompt = prompt(`Enter value to sort ${field} by:`);
    if (inputPrompt !== null && inputPrompt !== '') {
        const q = query(collection(db, "MovieApp"), orderBy(field));
        onSnapshot(q, (snapshot) => {
            const movies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const filteredMovies = movies.filter(movie => movie[field] === inputPrompt);
            displayMovieList(filteredMovies);
        });
    }
}

// Function to handle sorting with input for rating
function handleRatingSorting(field) {
    let minRating = parseFloat(prompt(`Enter minimum rating to sort by ${field}:`));
    let maxRating = parseFloat(prompt(`Enter maximum rating to sort by ${field}:`));

    if (!isNaN(minRating) && !isNaN(maxRating)) {
        const q = query(collection(db, "MovieApp"), orderBy(field));
        onSnapshot(q, (snapshot) => {
            const movies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const filteredMovies = movies.filter(movie => {
                const rating = parseFloat(movie[field]);
                return !isNaN(rating) && rating >= minRating && rating <= maxRating;
            });
            displayMovieList(filteredMovies);
        });
    }
}


// Add event listener for Add Movie button
document.getElementById('btn').addEventListener('click', addNewMovie);

// Add event listeners for sorting buttons
document.getElementById('sortTitle').addEventListener('click', () => handleSortingWithInput('title'));
document.getElementById('sortDirector').addEventListener('click', () => handleSortingWithInput('director'));
document.getElementById('sortRelease').addEventListener('click', () => handleSortingWithInput('releaseDate'));
document.getElementById('sortRating').addEventListener('click', () => handleRatingSorting('rating'));

// Initial query to display MovieApp sorted by title
sortMovieList('title');
