const section_login = document.getElementById("login_section")
const section_mainpage = document.getElementById("mainpage_section")
const section_createnote = document.getElementById("createnote_section")
const section_profile = document.getElementById("profile_section")
const notesContainer = document.getElementById("notes_container")



function showSection(sectionToShow) {
    const sections = [section_login, section_mainpage, section_createnote, section_profile];
    sections.forEach((section) => {
        if (section) {
            section.style.display = section === sectionToShow ? "block" : "none"; // Show the targeted section
        }
    });

    // Ensure header remains visible
    const header = document.getElementById("header_id");
    if (header) {
        header.style.display = sectionToShow !== section_login ? "block" : "none"; // Hide header for login
    }
}


async function loadNotes() {
    const notesContainer = document.getElementById('notes_container')
    notesContainer.innerHTML = '';

    const owner = 'testuser';
    const response = await fetch(`/api/notes?owner=${owner}`)

    if (!response.ok) {
        console.error('Failed to fetch notes, status:', response.status)
        notesContainer.innerHTML = '<p>Error fetching notes</p>';
        return
    }

    const notes = await response.json();

    notes.forEach(note => {
        const noteElement = document.createElement('div')
        noteElement.classList.add('note')

        const titleSpan = document.createElement('div')
        titleSpan.classList.add('title_note')
        titleSpan.textContent = note.title;

        const contentSpan = document.createElement('div')
        contentSpan.classList.add('content_note')
        contentSpan.textContent = note.content;

        noteElement.appendChild(titleSpan)
        noteElement.appendChild(contentSpan)

        notesContainer.appendChild(noteElement)
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadNotes();

    const addNoteButton = document.getElementById("add_note_button")
    if (addNoteButton) {
        addNoteButton.addEventListener("click", () => {
            showSection(section_createnote)
        })
    }

    const profileButton = document.getElementById("profile_button")
    if (profileButton) {
        profileButton.addEventListener("click", () => {
            showSection(section_profile)
        })
    }
    const mainPageButton = document.getElementById("logo_img")
    if (mainPageButton) {
        mainPageButton.addEventListener("click", () => {
            showSection(section_mainpage)
        })
    }
})

document.addEventListener("DOMContentLoaded", () => {
    async function submitLogin() {
        const username = document.getElementById("login_Username").value;
        const password = document.getElementById("login_Password").value;

        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            console.error("Login failed with status:", response.status)
            alert("Login failed.")
            return
        }

        const result = await response.json()
        if (result.success) {
            console.log("Login successful.");
            showSection(section_mainpage); // Switch to main page
            document.body.style.background = "rgba(242, 242, 242, 1)";
            await loadNotes(); // Load notes for the main page
        } else {
            alert("Login failed: " + result.message);
        }
    }

    document.getElementById("login_button").addEventListener("click", submitLogin)
})
function expandSearchBar() {
    const searchBar = document.getElementById("search_bar");
    searchBar.style.width = "60%";


    document.addEventListener("click", function handleClickOutside(event) {
        if (!searchBar.contains(event.target)) {
            searchBar.style.width = "30%";
            document.removeEventListener("click", handleClickOutside);
        }
    });
}
const editor = document.querySelector("#editor");
const preview = document.querySelector(".preview");

editor.addEventListener('input', e => {
    preview.innerHTML = DOMPurify.sanitize(marked.parse(e.target.value));
})