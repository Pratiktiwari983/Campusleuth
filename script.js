// CampusLeuth - Backend Connected

const API_URL = "https://campusleuth.onrender.com/api/items";

let items = [];


// 1. Fetch Items From Backend

async function loadItems() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch items");
        }

        const result = await response.json();

        items = result.data;

        displayItems(items);

    } catch (error) {
        console.error("Error loading items:", error);

        document.getElementById("items-container").innerHTML =
            "<p>Unable to load items. Please try again.</p>";
    }
}


// Display Items

function displayItems(data) {

    const container = document.getElementById("items-container");

    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = `
            <p style="color: #94a3b8;">
                No items found!
            </p>
        `;
        return;
    }

    data.forEach(item => {

        const card = document.createElement("div");

        card.classList.add("item-card");

        const date = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : "";

        // Display uploaded image or default icon
        const imageContent = item.imageUrl
            ? `<img src="${item.imageUrl}" alt="${item.name}" class="uploaded-image">`
            : `<div class="item-image">
                   ${item.type === "LOST" ? "🔍" : "📦"}
               </div>`;

        card.innerHTML = `
            ${imageContent}

            <div class="item-info">

                <span class="${item.type === "LOST" ? "lost-badge" : "found-badge"}">
                    ${item.type}
                </span>

                <h3>${item.name}</h3>

                <p>Category: ${item.category}</p>

                <p>Location: ${item.location}</p>

                <p>${item.description}</p>

                <p class="date">${date}</p>

                <button class="view-btn">
                    View Details
                </button>

            </div>
        `;

        const viewButton = card.querySelector(".view-btn");

        viewButton.addEventListener("click", () => {
            viewItem(item._id);
        });

        container.appendChild(card);

    });
}

// 3. View Item Details

function viewItem(id) {

    const selectedItem = items.find(item => item._id === id);

    if (!selectedItem) return;

    alert(
        "Item: " + selectedItem.name +
        "\nType: " + selectedItem.type +
        "\nCategory: " + selectedItem.category +
        "\nLocation: " + selectedItem.location +
        "\nDescription: " + selectedItem.description
    );

}


// 4. Search Functionality

const searchInput = document.getElementById("searchInput");

const searchButton = document.getElementById("searchButton");


function searchItems() {

    const query = searchInput.value.toLowerCase().trim();

    const filteredItems = items.filter(item => {

        return (
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query)
        );

    });

    displayItems(filteredItems);

}


searchButton.addEventListener("click", searchItems);


searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchItems();
    }

});


// 5. Report Item Form

const reportForm = document.getElementById("reportForm");

reportForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    try {
        let imageUrl = "";

        // 1. Get selected image
        const imageFile = document.getElementById("itemImage").files[0];

        // 2. Upload image to Cloudinary
        if (imageFile) {
            const formData = new FormData();
            formData.append("image", imageFile);

            const uploadResponse = await fetch(
                "https://campusleuth.onrender.com/api/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadResult.message);
            }

            imageUrl = uploadResult.imageUrl;
        }

        // 3. Create item object
        const newItem = {
            name: document.getElementById("itemName").value,
            type: document.getElementById("itemType").value,
            category: document.getElementById("itemCategory").value,
            location: document.getElementById("itemLocation").value,
            description: document.getElementById("itemDescription").value,
            imageUrl: imageUrl
        };
        console.log("Form data:", {
            name: document.getElementById("itemName").value,
            type: document.getElementById("itemType").value,
            category: document.getElementById("itemCategory").value,
            location: document.getElementById("itemLocation").value,
            description: document.getElementById("itemDescription").value
        });

        // 4. Save item in MongoDB
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newItem)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to report item");
        }

        alert("Your item has been reported successfully!");

        reportForm.reset();

        // 5. Refresh items
        loadItems();

    } catch (error) {
        console.error("Error reporting item:", error);
        alert("Unable to report item: " + error.message);
    }
    });

// 6. Image Preview

const imageInput = document.getElementById("itemImage");

if (imageInput) {

    imageInput.addEventListener("change", function() {

        const file = imageInput.files[0];

        if (file) {

            const imageURL = URL.createObjectURL(file);

            let preview = document.getElementById("imagePreview");

            if (!preview) {

                preview = document.createElement("img");

                preview.id = "imagePreview";

                preview.style.width = "150px";

                preview.style.marginTop = "10px";

                imageInput.after(preview);

            }

            preview.src = imageURL;

        }

    });

}


// 7. Load Items When Website Opens

loadItems();