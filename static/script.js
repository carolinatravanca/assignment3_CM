// Section References
const section_login = document.getElementById("login_section");
const section_mainpage = document.getElementById("mainpage_section");
const section_createnote = document.getElementById("createnote_section");
const section_profile = document.getElementById("profile_section");
const section_editnote = document.getElementById("editnote_section")
const section_create = document.getElementById("create_section")


// Helper Functions
function showSection(sectionToShow) {
    console.log(`Attempting to show section: ${sectionToShow?.id || "unknown"}`);
    const sections = [section_login, section_mainpage, section_createnote, section_profile, section_editnote, section_create];
    sections.forEach((section) => {
        if (section) {
            section.style.display = section === sectionToShow ? "block" : "none";
            console.log(`Setting display for ${section.id}: ${section.style.display}`);
        }
    });

    if (sectionToShow === section_createnote) {
        const noteTitle = document.querySelector(".block_createnote h1");
        const editor = document.getElementById("editor");
        const preview = document.querySelector(".preview")
        if (noteTitle) noteTitle.textContent = "Untitled"; // Reset title
        if (editor) editor.value = ""; // Reset content
        if (preview) preview.value = "";
    }

    const header = document.getElementById("header_id");
    if (header) {
        // Hide the header when showing login or create account sections
        header.style.display = (sectionToShow === section_login || sectionToShow === create_section) ? "none" : "block";
    }
}

async function fetchNotes(searchTerm = "") {
    const notesContainer = document.getElementById("notes_container");
    notesContainer.innerHTML = ""; // Clear notes container

    const ownerId = localStorage.getItem("loggedInUserId"); // Get logged-in user's ID
    if (!ownerId) {
        alert("User not logged in. Please log in again.");
        return;
    }

    const response = await fetch(`/api/notes?owner=${ownerId}&search=${encodeURIComponent(searchTerm)}`);

    if (!response.ok) {
        console.error("Failed to fetch notes, status:", response.status);
        notesContainer.innerHTML = "<p>Error fetching notes</p>";
        return;
    }

    const notes = await response.json();

    // Group notes by category
    const categories = {};
    notes.forEach(note => {
        const category = note.category || "All notes"; // Default category is "General"
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(note);
    });

    // Render notes grouped by category
Object.keys(categories).forEach(category => {
    const categoryRow = document.createElement("div");
    categoryRow.classList.add("category-row"); // Add a class for styling rows

    const categoryTitle = document.createElement("span");
    categoryTitle.classList.add("category-title");
    categoryTitle.textContent = category;

    const notesWrapper = document.createElement("div");
    notesWrapper.classList.add("notes-wrapper"); // Container for notes within this category

    categories[category].forEach(note => {
        const noteElement = document.createElement("div");
        noteElement.classList.add("note");

        const titleSpan = document.createElement("div");
        titleSpan.classList.add("title_note");
        titleSpan.textContent = note.title;

        const contentSpan = document.createElement("div");
        contentSpan.classList.add("content_note");
        contentSpan.textContent = note.text;

        const footer = document.createElement("div");
        footer.classList.add("note-footer");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("edit-button");
        editButton.addEventListener("click", () => {
            showEditNoteSection(note); // Pass the note to the edit function
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", async () => {
            const confirmDelete = confirm("Are you sure you want to delete this note?");
            if (confirmDelete) {
                const response = await fetch(`/api/notes/${note.id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    alert("Note deleted successfully!");
                    await fetchNotes(searchTerm); // Re-fetch notes with the current search term
                } else {
                    alert("Failed to delete note. Please try again.");
                }
            }
        });

        footer.appendChild(deleteButton);
        footer.appendChild(editButton);

        noteElement.appendChild(titleSpan);
        noteElement.appendChild(contentSpan);
        noteElement.appendChild(footer);

        notesWrapper.appendChild(noteElement); // Add the note to the notes wrapper
    });

    // Add category title and notes wrapper to the row
    categoryRow.appendChild(categoryTitle);
    categoryRow.appendChild(notesWrapper);

    // Append the row to the container
    notesContainer.appendChild(categoryRow);
});

}







async function submitLogin() {
    const username = document.getElementById("login_Username").value;
    const password = document.getElementById("login_Password").value;

    const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        console.error("Login failed with status:", response.status);
        console.log(localStorage.getItem("loggedInUserId"));

        alert("Login failed.");
        return;
    }

    const result = await response.json();
    if (result.success) {
        console.log("Login successful.");
        localStorage.setItem("loggedInUserId", result.user.id); // Save owner ID
        showSection(section_mainpage);
        document.body.style.background = "rgba(242, 242, 242, 1)";
        await fetchNotes();
    } else {
        alert("Login failed: " + result.message);
    }
}


function setupEventListeners() {
    // Add Note Button
    const addNoteButton = document.getElementById("add_note_button");
    if (addNoteButton) {
        addNoteButton.addEventListener("click", () => showSection(section_createnote));
    }

    // Profile Button
    const profileButton = document.getElementById("profile_button");
    if (profileButton) {
        profileButton.addEventListener("click", () => showSection(section_profile));
    }

    const searchInput = document.getElementById("search_input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            fetchNotes(e.target.value); // Pass the search term dynamically
        });
    }

    // Main Page Button
    const mainPageButton = document.getElementById("logo_img");
    if (mainPageButton) {
        mainPageButton.addEventListener("click", () => showSection(section_mainpage));
    }

    const goToCreateSectionLink = document.getElementById("go_to_create_section");
    if (goToCreateSectionLink) {
        goToCreateSectionLink.addEventListener("click", () => {
            const section_create = document.getElementById("create_section");
            showSection(section_create); // Show the create account section
        });
    }

    // Navigate to Login Section
    const goToLoginLink = document.getElementById("go_to_login");
    if (goToLoginLink) {
        goToLoginLink.addEventListener("click", () => {
            const section_login = document.getElementById("login_section");
            showSection(section_login); // Show the login section
        });
    }

    // Login Button
    const loginButton = document.getElementById("login_button");
    if (loginButton) {
        loginButton.addEventListener("click", submitLogin);
    }

    // Expand Search Bar
    const searchBar = document.getElementById("search_bar");
    if (searchBar) {
        searchBar.addEventListener("click", expandSearchBar)
    }

    // Save Changes Button
    const saveEditButton = document.getElementById("save_edit_button");
    if (saveEditButton) {
        saveEditButton.addEventListener("click", () => {
            // Save logic here
        });
    }

    // Cancel Button for Edit Section
    const cancelEditButton = document.getElementById("button_exit");
    if (cancelEditButton) {
        cancelEditButton.addEventListener("click", () => {
            showSection(section_mainpage); // Return to the main page
        });
    }

    const editButton = document.getElementById("")


    // Save Note Button
    const saveNoteButton = document.getElementById("button_save")
    const editor = document.getElementById("editor");
    const noteTitle = document.querySelector("#createnote_section h1");
    if (saveNoteButton) {
        saveNoteButton.addEventListener("click", async () => {
            const title = noteTitle.textContent.trim();
            const content = editor.value.trim();
            const ownerId = localStorage.getItem("loggedInUserId"); // Get owner ID from localStorage

            if (!ownerId) {
                alert("User not logged in. Please log in again.");
                return;
            }

            if (!title || !content) {
                alert("Both title and content are required!");
                return;
            }

            const response = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    owner: ownerId,
                    text: content,
                    title: title,
                }),
            });

            if (response.ok) {
                alert("Note saved successfully!");
                showSection(section_mainpage);
                await fetchNotes();
            } else {
                alert("Failed to save note. Please try again.");
            }
        });
    }
    const createAccountButton = document.getElementById("create_account_button");
    if (createAccountButton) {
        createAccountButton.addEventListener("click", async () => {
            const username = document.getElementById("create_Username").value.trim();
            const password = document.getElementById("create_Password").value.trim();

            if (!username || !password) {
                alert("Username and password are required.");
                return;
            }

            const response = await fetch("/api/createUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    alert("Account created successfully!");
                    showSection(section_login); // Redirect to login page
                } else {
                    alert(result.message);
                }
            } else {
                alert("Failed to create account. Please try again.");
            }
        });
    }

    const editorElement = document.querySelector("#editor");
    const preview = document.querySelector(".preview");
    if (editorElement && preview) {
        editorElement.addEventListener("input", e => {
            preview.innerHTML = DOMPurify.sanitize(marked.parse(e.target.value));
        })
    }
}

function expandSearchBar() {
    const searchBar = document.getElementById("search_bar");
    searchBar.style.width = "60%";

    document.addEventListener("click", function handleClickOutside(event) {
        if (!searchBar.contains(event.target)) {
            searchBar.style.width = "30%";
            document.removeEventListener("click", handleClickOutside)
        }
    })
}
function showEditNoteSection(note) {
    const editNoteSection = document.getElementById("editnote_section");
    const editNoteTitle = document.getElementById("edit_note_title");
    const editNoteContent = document.getElementById("edit_note_content");
    const editNotePreview = document.getElementById("edit_note_preview");
    const overlay = document.getElementById("editnote_overlay");
  
    // Ensure all required elements exist
    if (!editNoteSection || !editNoteTitle || !editNoteContent || !editNotePreview || !overlay) {
      console.error("Required elements for edit note are missing.");
      return;
    }
  
    // Populate the edit section with the note's current data
    editNoteTitle.textContent = note.title || "Untitled";
    editNoteContent.value = note.text || "";
    editNotePreview.innerHTML = DOMPurify.sanitize(marked.parse(note.text || ""));
  
    // Display the edit section and overlay
    editNoteSection.style.display = "block";
    overlay.style.display = "block";
  
    // Live preview update
    editNoteContent.addEventListener("input", (e) => {
      editNotePreview.innerHTML = DOMPurify.sanitize(marked.parse(e.target.value));
    });
  
    // Save changes
    const saveEditButton = document.getElementById("save_edit_button");
    saveEditButton.onclick = async () => {
      const updatedTitle = editNoteTitle.textContent.trim();
      const updatedContent = editNoteContent.value.trim();
  
      if (!updatedTitle || !updatedContent) {
        alert("Both title and content are required!");
        return;
      }
  
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTitle,
          text: updatedContent,
        }),
      });
  
      if (response.ok) {
        alert("Note updated successfully!");
        editNoteSection.style.display = "none";
        overlay.style.display = "none";
        await fetchNotes(); // Refresh notes
      } else {
        alert("Failed to update note. Please try again.");
      }
    };
  
    // Cancel edit
    const cancelEditButton = document.getElementById("cancel_edit_button");
    cancelEditButton.onclick = () => {
      editNoteSection.style.display = "none";
      overlay.style.display = "none";
    };
  }
  


document.addEventListener("DOMContentLoaded", () => {
    fetchNotes()
    setupEventListeners()
});