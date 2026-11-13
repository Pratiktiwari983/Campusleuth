const API_URL = "https://campusleuth.onrender.com/api/items";
const UPLOAD_URL = "https://campusleuth.onrender.com/api/upload";

let items = [];
let previewObjectUrl = null;

const byId = (id) => document.getElementById(id);

const asText = (value) =>
    value === null || value === undefined ? "" : String(value);

async function readJsonResponse(response) {
    const text = await response.text();
    let data;

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error(
            `Server returned an invalid response (HTTP ${response.status}).`
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message || data.error ||
            `Request failed (HTTP ${response.status}).`
        );
    }

    return data;
}

function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

function safeImageUrl(value) {
    try {
        const url = new URL(asText(value));

        return url.protocol === "https:" &&
            url.hostname === "res.cloudinary.com"
            ? url.href
            : "";
    } catch {
        return "";
    }
}

function displayItems(list) {
    const container = byId("items-container");

    if (!container) return;

    container.replaceChildren();

    if (!Array.isArray(list) || list.length === 0) {
        container.appendChild(
            makeElement(
                "p",
                "empty-state",
                "No items found. Be the first to report one!"
            )
        );
        return;
    }

    list.forEach((item) => {
        const card = makeElement("article", "item-card");

        const imageUrl = safeImageUrl(item.imageUrl);

        if (imageUrl) {
            const image = makeElement("img", "uploaded-image");

            image.src = imageUrl;
            image.alt = asText(item.name) || "Reported item";
            image.loading = "lazy";
            image.referrerPolicy = "no-referrer";

            card.appendChild(image);
        } else {
            card.appendChild(
                makeElement("div", "item-image", "📦")
            );
        }

        const info = makeElement("div", "item-info");

        const type = asText(item.type).toUpperCase();

        info.appendChild(
            makeElement(
                "span",
                type === "LOST" ? "lost-badge" : "found-badge",
                type || "ITEM"
            )
        );

        info.appendChild(
            makeElement(
                "h3",
                "",
                asText(item.name) || "Untitled item"
            )
        );

        info.appendChild(
            makeElement(
                "p",
                "",
                `Category: ${asText(item.category) || "Not specified"}`
            )
        );

        info.appendChild(
            makeElement(
                "p",
                "",
                `Location: ${asText(item.location) || "Not specified"}`
            )
        );

        info.appendChild(
            makeElement(
                "p",
                "",
                asText(item.description) || "No description provided."
            )
        );

        const createdAt = item.createdAt
            ? new Date(item.createdAt)
            : null;

        const dateText =
            createdAt && !Number.isNaN(createdAt.getTime())
                ? createdAt.toLocaleDateString()
                : "";

        if (dateText) {
            info.appendChild(
                makeElement("small", "date", dateText)
            );
        }

        const viewButton = makeElement(
            "button",
            "view-btn",
            "View Details"
        );

        viewButton.type = "button";

        viewButton.addEventListener("click", () => {
            viewItem(item._id);
        });

        info.appendChild(viewButton);
        card.appendChild(info);
        container.appendChild(card);
    });
}

function viewItem(id) {
    const item = items.find(
        (entry) => asText(entry._id) === asText(id)
    );

    if (!item) return;

    const details = [
        `Name: ${asText(item.name)}`,
        `Type: ${asText(item.type)}`,
        `Category: ${asText(item.category)}`,
        `Location: ${asText(item.location)}`,
        `Description: ${asText(item.description)}`
    ].join("\n");

    window.alert(details);
}

async function loadItems() {
    const container = byId("items-container");

    try {
        const response = await fetch(API_URL);
        const result = await readJsonResponse(response);

        if (!Array.isArray(result.data)) {
            throw new Error(
                "The server response did not contain an items list."
            );
        }

        items = result.data;
        displayItems(items);

    } catch (error) {
        console.error("Unable to load items:", error);

        if (container) {
            container.replaceChildren(
                makeElement(
                    "p",
                    "empty-state",
                    "Could not load items right now. Please refresh and try again."
                )
            );
        }
    }
}

function searchItems() {
    const input = byId("searchInput");

    const query = asText(input?.value)
        .trim()
        .toLowerCase();

    if (!query) {
        displayItems(items);
        return;
    }

    const filtered = items.filter((item) => {
        const searchable = [
            item.name,
            item.category,
            item.location,
            item.description,
            item.type
        ]
            .map((value) => asText(value).toLowerCase())
            .join(" ");

        return searchable.includes(query);
    });

    displayItems(filtered);
}

function clearImagePreview() {
    const preview = byId("imagePreview");

    if (preview) preview.remove();

    if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = null;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const searchInput = byId("searchInput");
    const searchButton = byId("searchButton");
    const form = byId("reportForm");
    const imageInput = byId("itemImage");

    searchButton?.addEventListener("click", searchItems);

    searchInput?.addEventListener("input", searchItems);

    imageInput?.addEventListener("change", () => {

        clearImagePreview();

        const file = imageInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            window.alert("Please select an image file.");
            imageInput.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            window.alert("Image size must be 5 MB or less.");
            imageInput.value = "";
            return;
        }

        previewObjectUrl = URL.createObjectURL(file);

        const preview = makeElement("img");

        preview.id = "imagePreview";
        preview.src = previewObjectUrl;
        preview.alt = "Selected image preview";

        preview.style.display = "block";
        preview.style.maxWidth = "180px";
        preview.style.maxHeight = "150px";
        preview.style.objectFit = "cover";
        preview.style.marginTop = "12px";

        imageInput.insertAdjacentElement(
            "afterend",
            preview
        );
    });

    form?.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name = asText(byId("itemName")?.value).trim();

        const type = asText(byId("itemType")?.value)
            .trim()
            .toUpperCase();

        const category = asText(byId("itemCategory")?.value).trim();

        const location = asText(byId("itemLocation")?.value).trim();

        const description = asText(
            byId("itemDescription")?.value
        ).trim();

        const imageFile = imageInput?.files?.[0];

        if (
            !name ||
            !["LOST", "FOUND"].includes(type) ||
            !category ||
            !location ||
            !description
        ) {
            window.alert("Please fill in all required fields.");
            return;
        }

        const submitButton = form.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        const originalButtonText =
            submitButton?.tagName === "INPUT"
                ? submitButton.value
                : submitButton?.textContent;

        if (submitButton) {
            submitButton.disabled = true;

            if (submitButton.tagName === "INPUT") {
                submitButton.value = "Submitting...";
            } else {
                submitButton.textContent = "Submitting...";
            }
        }

        try {

            let imageUrl = "";

            if (imageFile) {

                if (
                    !imageFile.type.startsWith("image/") ||
                    imageFile.size > 5 * 1024 * 1024
                ) {
                    throw new Error(
                        "Choose a valid image that is 5 MB or smaller."
                    );
                }

                const formData = new FormData();

                formData.append("image", imageFile);

                const uploadResponse = await fetch(
                    UPLOAD_URL,
                    {
                        method: "POST",
                        body: formData
                    }
                );

                const uploadResult =
                    await readJsonResponse(uploadResponse);

                imageUrl = asText(uploadResult.imageUrl);

                if (!safeImageUrl(imageUrl)) {
                    throw new Error(
                        "Image upload did not return a valid image URL."
                    );
                }
            }

            const response = await fetch(API_URL, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    type,
                    category,
                    location,
                    description,
                    imageUrl
                })
            });

            await readJsonResponse(response);

            form.reset();

            clearImagePreview();

            await loadItems();

            window.alert(
                "Your report has been submitted successfully!"
            );

        } catch (error) {

            console.error("Unable to submit item:", error);

            window.alert(
                error.message ||
                "Something went wrong. Please try again."
            );

        } finally {

            if (submitButton) {

                submitButton.disabled = false;

                if (submitButton.tagName === "INPUT") {
                    submitButton.value =
                        originalButtonText || "Submit";
                } else {
                    submitButton.textContent =
                        originalButtonText || "Submit";
                }
            }
        }
    });

    loadItems();
});