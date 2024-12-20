const section_login = document.getElementById("login_section");
const section_mainpage = document.getElementById("mainpage_section");
const section_createnote = document.getElementById("createnote_section");
const section_profile = document.getElementById("profile_section");
const section_editnote = document.getElementById("editnote_section")
const section_create = document.getElementById("create_section")

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
        if (noteTitle) noteTitle.textContent = "Untitled";
        if (editor) editor.value = "";
        if (preview) preview.value = "";
    }

    const header = document.getElementById("header_id");
    if (header) {
        header.style.display = (sectionToShow === section_login || sectionToShow === create_section) ? "none" : "block";
    }
}

async function fetchNotes(searchTerm = "") {
    const notesContainer = document.getElementById("notes_container");
    notesContainer.innerHTML = "";

    const ownerId = localStorage.getItem("loggedInUserId");
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
    const categories = {};
    notes.forEach(note => {
        const category = note.category || "All notes";
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(note);
    });

    Object.keys(categories).forEach(category => {
        const categoryRow = document.createElement("div");
        categoryRow.classList.add("category-row"); 

        const categoryTitle = document.createElement("span");
        categoryTitle.classList.add("category-title");
        categoryTitle.textContent = category;

        const notesWrapper = document.createElement("div");
        notesWrapper.classList.add("notes-wrapper"); 

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
                showEditNoteSection(note);
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
                        await fetchNotes(searchTerm);
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

            notesWrapper.appendChild(noteElement);
        });

        categoryRow.appendChild(categoryTitle);
        categoryRow.appendChild(notesWrapper);

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
        localStorage.setItem("loggedInUserId", result.user.id);
        showSection(section_mainpage);
        document.body.style.background = "rgba(242, 242, 242, 1)";
        await fetchNotes();
    } else {
        alert("Login failed: " + result.message);
    }
}


function setupEventListeners() {
    const addNoteButton = document.getElementById("add_note_button");
    if (addNoteButton) {
        addNoteButton.addEventListener("click", () => showSection(section_createnote));
    }

    const profileButton = document.getElementById("profile_button");
    if (profileButton) {
        profileButton.addEventListener("click", () => showSection(section_profile));
    }

    const searchInput = document.getElementById("search_input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            fetchNotes(e.target.value); 
        });
    }

    const mainPageButton = document.getElementById("logo_img");
    if (mainPageButton) {
        mainPageButton.addEventListener("click", () => showSection(section_mainpage));
    }

    const goToCreateSectionLink = document.getElementById("go_to_create_section");
    if (goToCreateSectionLink) {
        goToCreateSectionLink.addEventListener("click", () => {
            const section_create = document.getElementById("create_section");
            showSection(section_create); 
        });
    }

    const goToLoginLink = document.getElementById("go_to_login");
    if (goToLoginLink) {
        goToLoginLink.addEventListener("click", () => {
            const section_login = document.getElementById("login_section");
            showSection(section_login);
        });
    }

    const loginButton = document.getElementById("login_button");
    if (loginButton) {
        loginButton.addEventListener("click", submitLogin);
    }

    const searchBar = document.getElementById("search_bar");
    if (searchBar) {
        searchBar.addEventListener("click", expandSearchBar)
    }

    const saveEditButton = document.getElementById("save_edit_button");
    if (saveEditButton) {
        saveEditButton.addEventListener("click", () => {
            showSection(section_mainpage); 
        });
    }

    const cancelEditButton = document.getElementById("button_exit");
    if (cancelEditButton) {
        cancelEditButton.addEventListener("click", () => {
            showSection(section_mainpage); 
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
            const ownerId = localStorage.getItem("loggedInUserId");

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
                    showSection(section_login);
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

    if (!editNoteSection || !editNoteTitle || !editNoteContent || !editNotePreview || !overlay) {
        console.error("Required elements for edit note are missing.");
        return;
    }

    editNoteTitle.textContent = note.title || "Untitled";
    editNoteContent.value = note.text || "";
    editNotePreview.innerHTML = DOMPurify.sanitize(marked.parse(note.text || ""));

    editNoteSection.style.display = "block";
    overlay.style.display = "block";

    editNoteContent.addEventListener("input", (e) => {
        editNotePreview.innerHTML = DOMPurify.sanitize(marked.parse(e.target.value));
    });

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
            await fetchNotes();
        } else {
            alert("Failed to update note. Please try again.");
        }
    };

    const cancelEditButton = document.getElementById("cancel_edit_button");
    cancelEditButton.onclick = () => {
        editNoteSection.style.display = "none";
        overlay.style.display = "none";
    };
}

const displayImage = document.getElementById('display-image');
const imageInput = document.getElementById('image-input');


const savedImage = localStorage.getItem('selectedImage');
if (savedImage) {
    displayImage.src = savedImage;
}


imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; 

    if (file) {
        const reader = new FileReader();


        reader.onload = (e) => {
            const dataUrl = e.target.result;

            displayImage.src = dataUrl;


            localStorage.setItem('selectedImage', dataUrl);
        };

        reader.readAsDataURL(file); 
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetchNotes()
    setupEventListeners()
});


function toggleMenu() {
    const links = document.getElementById("header_links");
    links.classList.toggle("active");
  
    if (links.classList.contains("active")) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
  }
  
  function handleOutsideClick(event) {
    const links = document.getElementById("header_links");
    const hamburgerMenu = document.getElementById("hamburger_menu");
  
    if (!links.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      links.classList.remove("active");
      document.removeEventListener("click", handleOutsideClick);
    }
  }