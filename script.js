// Sample Items

let items = [
    {
        name: "Wireless Headphones",
        type: "LOST",
        category: "Electronics",
        location: "Library",
        description: "Black wireless headphones"
    },

    {
        name: "Student ID Card",
        type: "FOUND",
        category: "Documents",
        location: "Cafeteria",
        description: "Student ID card found"
    },

    {
        name: "Smart Watch",
        type: "LOST",
        category: "Electronics",
        location: "Academic Block",
        description: "Black smart watch"
    }
];

// Display Items

function displayItems(data) {

    const container = document.getElementById("items-container");

    container.innerHTML = "";

    data.forEach(function(item) {

        const card = document.createElement("div");

        card.className = "item-card";

        card.innerHTML = `
            <div class="item-image">📦</div>

            <div class="item-info">

                <span class="${item.type === "LOST" ? "lost-badge" : "found-badge"}">
                    ${item.type}
                </span>

                <h3>${item.name}</h3>

                <p>Category: ${item.category}</p>

                <p>Location: ${item.location}</p>

                <p>${item.description}</p>

            </div>
        `;

        container.appendChild(card);

    });

}

// Report Form

const form = document.getElementById("reportForm");

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const newItem = {

        name: document.getElementById("itemName").value,

        type: document.getElementById("itemType").value,

        category: document.getElementById("itemCategory").value,

        location: document.getElementById("itemLocation").value,

        description: document.getElementById("itemDescription").value

    };

    items.unshift(newItem);

    localStorage.setItem("campusItems", JSON.stringify(items));

    displayItems(items);

    form.reset();

    alert("Item reported successfully!");

});

// Load Saved Items

const savedItems = localStorage.getItem("campusItems");

if (savedItems) {
    items = JSON.parse(savedItems);
}

// Initial Display

displayItems(items);