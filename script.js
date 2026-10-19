
$(function () {
  // Replace these sample entries with your real book details.
  // Keep each PDF file path matched to the correct book ID.
  const books = [
    {
      id: 1,
      title: "The Last Letter at Midnight",
      genre: "Romance · Drama",
      category: "romance",
      price: 4.99,
      description:
        "Two strangers begin exchanging letters that uncover a forgotten family secret. A story about trust, memory, and unexpected connection.",
      excerpt:
        "PREVIEW PLACEHOLDER\n\nReplace this text with the opening paragraph from your own finished manuscript.",
      pdf: "books/last-letter.pdf"
    },
    {
      id: 2,
      title: "The Library of Forgotten Names",
      genre: "Fantasy · Mystery",
      category: "fantasy",
      price: 5.99,
      description:
        "An aspiring archivist discovers a hidden library in which forgotten memories are preserved between the pages of mysterious books.",
      excerpt:
        "PREVIEW PLACEHOLDER\n\nReplace this text with a short excerpt from your own original fantasy novel.",
      pdf: "books/forgotten-names.pdf"
    },
    {
      id: 3,
      title: "Small Steps Forward",
      genre: "Nonfiction · Personal Growth",
      category: "nonfiction",
      price: 3.99,
      description:
        "A practical, reflective guide to building routines, setting goals, and approaching everyday progress with intention.",
      excerpt:
        "PREVIEW PLACEHOLDER\n\nReplace this text with a useful sample passage from your own finished guide.",
      pdf: "books/small-steps.pdf"
    }
  ];

  let cart = [];
  let activeGenre = "all";
  let selectedPreviewId = null;
  let lastFocusedElement = null;
  let toastTimer;

  const money = amount => "$" + amount.toFixed(2);

  $("#year").text(new Date().getFullYear());

  function showToast(message) {
    clearTimeout(toastTimer);

    $("#toast").text(message).addClass("show");

    toastTimer = setTimeout(function () {
      $("#toast").removeClass("show");
    }, 2500);
  }

  function getBook(id) {
    return books.find(book => book.id === Number(id));
  }

  // Search and genre filters.
  function filterBooks() {
    const query = $("#book-search").val().trim().toLowerCase();
    let visible = 0;

    $(".book-card").each(function () {
      const book = getBook($(this).attr("data-id"));
      if (!book) return;

      const searchable =
        (book.title + " " + book.genre + " " + book.description)
          .toLowerCase();

      const matchesText = searchable.includes(query);
      const matchesGenre =
        activeGenre === "all" || book.category === activeGenre;

      const shouldShow = matchesText && matchesGenre;

      $(this).toggle(shouldShow);

      if (shouldShow) visible++;
    });

    $("#no-books").prop("hidden", visible !== 0);
  }

  $("#book-search").on("input", filterBooks);

  $(".genre-filter").on("click", function () {
    activeGenre = $(this).attr("data-genre");

    $(".genre-filter").removeClass("active");
    $(this).addClass("active");

    filterBooks();
  });

  // Book preview dialog.
  function openPreview(id, trigger) {
    const book = getBook(id);
    if (!book) return;

    selectedPreviewId = book.id;
    lastFocusedElement = trigger || document.activeElement;

    $("#preview-genre").text(book.genre);
    $("#preview-title").text(book.title);
    $("#preview-description").text(book.description);
    $("#preview-excerpt").text(book.excerpt);
    $("#preview-price").text(money(book.price));

    $("#preview-modal")
      .addClass("open")
      .attr("aria-hidden", "false");

    $("body").addClass("modal-open");
    $("#preview-close").trigger("focus");
  }

  function closePreview() {
    $("#preview-modal")
      .removeClass("open")
      .attr("aria-hidden", "true");

    $("body").removeClass("modal-open");

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  $(".preview-button").on("click", function () {
    openPreview($(this).attr("data-id"), this);
  });

  $("#preview-close").on("click", closePreview);

  $("#preview-modal").on("click", function (event) {
    if (event.target === this) closePreview();
  });

  $("#preview-add").on("click", function () {
    if (selectedPreviewId === null) return;

    addToCart(selectedPreviewId);
    closePreview();
  });

  // Cart.
  function addToCart(id) {
    const book = getBook(id);
    if (!book) return;

    const existing = cart.find(item => item.id === book.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: book.id,
        quantity: 1
      });
    }

    renderCart();
    showToast('"' + book.title + '" added to your bag.');
  }

  $(".add-button").on("click", function () {
    addToCart($(this).attr("data-id"));
  });

  function renderCart() {
    const totalItems = cart.reduce(
      (sum, item) => sum + item.quantity, 0
    );

    const subtotal = cart.reduce((sum, item) => {
      const book = getBook(item.id);
      return sum + (book ? book.price * item.quantity : 0);
    }, 0);

    $("#cart-count").text(totalItems);
    $("#cart-subtotal").text(money(subtotal));

    const $items = $("#cart-items").empty();

    if (cart.length === 0) {
      $("<p>")
        .addClass("cart-empty")
        .text("Your reading bag is waiting for a story. ♡")
        .appendTo($items);

      $("#checkout-button").prop("disabled", true);
      return;
    }

    $("#checkout-button").prop("disabled", false);

    cart.forEach(item => {
      const book = getBook(item.id);
      if (!book) return;

      const $row = $("<div>").addClass("cart-item");
      const $details = $("<div>");
      const $title = $("<h3>").text(book.title);
      const $price = $("<p>").text(money(book.price) + " per ebook");
      const $actions = $("<div>").addClass("cart-actions");

      const $decrease = $("<button>")
        .attr({
          type: "button",
          "aria-label": "Decrease quantity",
          "data-id": book.id,
          "data-change": -1
        })
        .addClass("quantity-change")
        .text("−");

      const $quantity = $("<span>").text(item.quantity);

      const $increase = $("<button>")
        .attr({
          type: "button",
          "aria-label": "Increase quantity",
          "data-id": book.id,
          "data-change": 1
        })
        .addClass("quantity-change")
        .text("+");

      const $remove = $("<button>")
        .attr({
          type: "button",
          "data-id": book.id
        })
        .addClass("remove-item")
        .text("Remove");

      const $lineTotal = $("<strong>")
        .text(money(book.price * item.quantity));

      $actions.append(
        $decrease, $quantity, $increase, $remove
      );

      $details.append($title, $price, $actions);
      $row.append($details, $lineTotal);
      $items.append($row);
    });
  }

  $("#cart-items").on("click", ".quantity-change", function () {
    const id = Number($(this).attr("data-id"));
    const change = Number($(this).attr("data-change"));
    const item = cart.find(entry => entry.id === id);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
      cart = cart.filter(entry => entry.id !== id);
    }

    renderCart();
  });

  $("#cart-items").on("click", ".remove-item", function () {
    const id = Number($(this).attr("data-id"));

    cart = cart.filter(item => item.id !== id);
    renderCart();
  });

  function openCart() {
    $("body").addClass("cart-open");

    $("#cart-panel").attr("aria-hidden", "false");
    $("#cart-close").trigger("focus");
  }

  function closeCart() {
    $("body").removeClass("cart-open");

    $("#cart-panel").attr("aria-hidden", "true");
    $("#cart-toggle").trigger("focus");
  }

  $("#cart-toggle").on("click", openCart);
  $("#cart-close, #cart-overlay").on("click", closeCart);

  $(document).on("keydown", function (event) {
    if (event.key !== "Escape") return;

    if ($("#preview-modal").hasClass("open")) {
      closePreview();
    } else if ($("body").hasClass("cart-open")) {
      closeCart();
    }
  });

  // Demo checkout. It deliberately does not charge anyone.
  $("#checkout-button").on("click", function () {
    if (cart.length === 0) return;

    showToast(
      "Demo checkout only. No payment or download is processed."
    );
  });

  // Demo newsletter. No email is transmitted or saved.
  $("#newsletter-form").on("submit", function (event) {
    event.preventDefault();

    $("#newsletter-message").text(
      "Thank you! The newsletter isn't connected yet."
    );

    this.reset();
  });

  renderCart();
});
