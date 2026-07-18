let verifyTimeout;
let verifiedUser = null;
// ========== 1️⃣ USERNAME VERIFICATION (Debounced) ==========
$(".username-verify").on("input", function () {
    clearTimeout(verifyTimeout);
    verifyTimeout = setTimeout(() => verifyUsername(), 500);
});
function verifyUsername(callback = null) {
    const data = collectFormData(".username-verify");
    if (!isFormComplete(data)) {
        $("#verify-result").html("");
        verifiedUser = null;
        if (typeof callback === "function") callback(false);
        return;
    }
    const $form = $(".username-verify-container");
    // START animation
    $form.addClass("verifying");
    data.gameSlug = $("#game-id").val();
    const isoCountryMap = {
        PH: "Philippines",
        SG: "Singapore",
        MY: "Malaysia",
        ID: "Indonesia",
        RU: "Russia",
    };
    $.ajax({
        url: "required/gamison",
        method: "POST",
        data,
        dataType: "json",
        success: (response) => {
            $form.addClass("verified-success");
            setTimeout(() => $form.removeClass("verified-success"), 1500);
            handleUsernameVerificationResponse(response, isoCountryMap, data, callback,);
        },
        error: () => {
            verifiedUser = null;
            $("#verify-result").html(
                `<div class="alert alert-danger"><i class="fas fa-circle-xmark"></i> Something went wrong. Try again.</div>`
            );
            if (typeof callback === "function") callback(false);
        },
        complete: () => {
            // STOP animation
            $form.removeClass("verifying");
        }
    });
}
function handleUsernameVerificationResponse(response, isoMap, data, callback) {
    if (response.success && response.data?.data?.username) {
        const user = response.data.data;
        verifiedUser = user;
        if (user.redirect_url) {
            const countryName =
                isoMap[user.country?.toUpperCase()] || "another region";
            $("#verify-result").html(`
        <div class="alert alert-info">
          <strong>Notice:</strong> This account belongs to <strong>${countryName}</strong>.<br/>
          Please visit the correct site:<br/>
          <a href="${user.redirect_url}" target="_blank" class="btn btn-primary btn-sm mt-2">Go to ${countryName} Page</a>
        </div>`);
            // Important: callback(false) or callback(true)? original flow stops here and doesn't allow purchase on this region,
            // so we call callback(false) to tell caller it's not usable here.
            if (typeof callback === "function") callback(false);
            return;
        }
        const verifiedMsg =
            user.username === "Verification Pending"
                ? `<i class="fas fa-circle-exclamation"></i> Verified.`
                : `<i class="fas fa-circle-check"></i> ${user.username} ${user.country ? `(Region : ${user.country})` : ""}`;
        $("#verify-result").html(
            `<div class="alert alert-success"><strong>Username:</strong> ${verifiedMsg}</div>`,
        );
        if (typeof callback === "function") callback(true, data, user);
    } else {
        verifiedUser = null;
        $("#verify-result").html(
            `<div class="alert alert-danger"><i class="fas fa-circle-xmark"></i> ${response.message || "User not found"}</div>`,
        );
        if (typeof callback === "function") callback(false);
    }
}
// $("#buy-now").on("click", function () {
//     const $btn = $(this);
//     if ($btn.prop("disabled")) return;
//     $btn.prop("disabled", true).text("Processing...");
//     const userData = collectFormData(".username-verify");
//     if (!isFormComplete(userData)) {
//         showSwal("info", "Incomplete Details", "Please fill in all required fields before verifying.");
//         $btn.prop("disabled", false).text("Buy Now");
//         return;
//     }
//     verifyUsername(function (isVerified, verifiedData, userInfo) {
//         if (!isVerified) {
//             showSwal("warning", "Verification Required", "Please check user ID details again.");
//             $btn.prop("disabled", false).text("Buy Now");
//             return;
//         }
//         const selectedPackage = $("[name='package_selection']:checked").val();
//         const selectedPackageName = $("[name='package_selection']:checked").closest(".col-6").find("label .product-name").text();
//         const selectedPackageAmount = $("[name='package_selection']:checked").closest(".col-6").find("label small:eq(0)").text();
//         if (!selectedPackage?.trim()) {
//             showSwal("warning", "No Package Selected", "Please select a package before proceeding.");
//             $btn.prop("disabled", false).text("Buy Now");
//             return;
//         }
//         const email = $("#order-email").val().trim();
//         if (email && !isValidEmail(email)) {
//             showSwal("warning", "Invalid Email", "Please enter a valid email address.");
//             $btn.prop("disabled", false).text("Buy Now");
//             return;
//         }
//         const orderData = {
//             ...verifiedData,
//             package: selectedPackage,
//             selectedPackageName,
//             selectedPackageAmount,
//             email,
//             username: userInfo.username,
//             gameSlug: $("#game-id").val(),
//         };
//         $.ajax({
//             url: "required/gamison",
//             method: "POST",
//             data: orderData,
//             dataType: "json",
//             success: function (response) {
//                 if (!response.success && response.message === "Guest Checkout allowed now.") {
//                     openGuestCheckoutModal(orderData, response.whatsapp_order);
//                     return;
//                 }
//                 handleOrderResponse(response);
//             },
//             error: function () {
//                 showSwal("error", "Server Error", "Something went wrong while placing the order.");
//             },
//             complete: function () {
//                 $btn.prop("disabled", false).text("Buy Now");
//             }
//         });
//     });
// });
$(document).on("click", ".payment-gateway-btn", function () {
    const $btn = $(this);
    const $buttons = $(".payment-gateway-btn");
    if ($btn.prop("disabled")) return;
    const gateway = $btn.data("payment-gateway");
    const originalText = $btn.html();
    $buttons.prop("disabled", true).addClass("disabled");
    $btn.html('<span class="spinner-border spinner-border-sm me-2"></span>Processing...');
    const userData = collectFormData(".username-verify");
    if (!isFormComplete(userData)) {
        showSwal("info", "Incomplete Details", "Please fill in all required fields before verifying.");
        $buttons.prop("disabled", false).removeClass("disabled");
        $btn.html(originalText);
        return;
    }
    verifyUsername(function (isVerified, verifiedData, userInfo) {
        if (!isVerified) {
            showSwal("warning", "Verification Required", "Please check user ID details again.");
            $buttons.prop("disabled", false).removeClass("disabled");
            $btn.html(originalText);
            return;
        }
        const selectedPackage = $("[name='package_selection']:checked").val();
        const selectedPackageName = $("[name='package_selection']:checked")
            .closest(".col-6")
            .find("label .product-name")
            .text();
        const selectedPackageAmount = $("[name='package_selection']:checked")
            .closest(".col-6")
            .find("label small:eq(0)")
            .text();
        if (!selectedPackage?.trim()) {
            showSwal("warning", "No Package Selected", "Please select a package before proceeding.");
            $buttons.prop("disabled", false).removeClass("disabled");
            $btn.html(originalText);
            return;
        }
        const email = $("#order-email").val().trim();
        if (email && !isValidEmail(email)) {
            showSwal("warning", "Invalid Email", "Please enter a valid email address.");
            $buttons.prop("disabled", false).removeClass("disabled");
            $btn.html(originalText);
            return;
        }
        const orderData = {
            ...verifiedData,
            package: selectedPackage,
            selectedPackageName,
            selectedPackageAmount,
            email,
            username: userInfo.username,
            gameSlug: $("#game-id").val(),
            gateway: gateway
        };
        $.ajax({
            url: "required/gamison",
            method: "POST",
            data: orderData,
            dataType: "json",
            success: function (response) {
                if (!response.success && response.message === "Guest Checkout allowed now.") {
                    openGuestCheckoutModal(
                        orderData,
                        response.whatsapp_order
                    );
                    return;
                }
                handleOrderResponse(response);
            },
            error: function () {
                showSwal(
                    "error",
                    "Server Error",
                    "Something went wrong while placing the order."
                );
            },
            complete: function () {
                $buttons.prop("disabled", false).removeClass("disabled");
                $btn.html(originalText);
            }
        });
    });
});
function openGuestCheckoutModal(orderData, whatsapp_order) {
    Swal.fire({
        html: `
      <div class="row text-start">
        <div class="col-lg-12">
          <h2 class="swal2-title">Guest Checkout</h2>
          ${generateGuestFormHTML(orderData, whatsapp_order)}
        </div>
      </div>`,
        showConfirmButton: false,
        showCancelButton: false,
        background: "#0d1117",
        color: "#fff",
        customClass: {
            popup: "rounded-3 shadow-lg border border-secondary",
        },
        didOpen: () => {
            const nameInput = $("#guest_name");
            const emailInput = $("#guest_email");
            const phoneInput = $("#guest_phone");
            const ageCheckbox = $("#is_18plus");
            const confirmBtn = $("#customConfirmBtn");
            const cancelBtn = $("#swalCloseBtn");
            const validateForm = () => {
                const valid =
                    nameInput.val().trim() &&
                    /^[^@]+@[^@]+\.[^@]+$/.test(emailInput.val().trim()) &&
                    /^\d{10}$/.test(phoneInput.val().trim()) &&
                    ageCheckbox.is(":checked");
                confirmBtn.prop("disabled", !valid);
            };
            [nameInput, emailInput, phoneInput, ageCheckbox].forEach((el) =>
                el.on("input change", validateForm),
            );
            cancelBtn.on("click", () => Swal.close());
            confirmBtn.on("click", function () {
                if (confirmBtn.prop("disabled")) return;
                const guestData = {
                    guest: true,
                    guestName: nameInput.val().trim(),
                    guestEmail: emailInput.val().trim(),
                    guestPhone: phoneInput.val().trim(),
                    is18: ageCheckbox.is(":checked"),
                    gameSlug: orderData.gameSlug,
                    package: orderData.package,
                    email: orderData.email,
                };
                // 🔹 Step 2: Submit Guest Form
                $.ajax({
                    url: "required/gamison",
                    method: "POST",
                    dataType: "json",
                    data: guestData,
                    beforeSend: function () {
                        confirmBtn.prop("disabled", true).text("Submitting...");
                    },
                    success: function (resp2) {
                        if (resp2.success && resp2.message) {
                            Swal.close();
                            openOTPModal(resp2.message, guestData.guestEmail);
                        } else {
                            showSwal(
                                "error",
                                "Guest Checkout Failed",
                                resp2.message || "Please try again.",
                            );
                        }
                    },
                    error: function () {
                        showSwal(
                            "error",
                            "Server Error",
                            "Something went wrong during guest checkout.",
                        );
                    },
                    complete: function () {
                        confirmBtn.text("Continue as Guest");
                    },
                });
            });
            validateForm();
        },
    });
}
function generateGuestFormHTML(orderData, whatsapp_order) {
    let whatsapp_button = '';
    if (whatsapp_order == 1) {
        const gameName = $("#gameNameForWhatsapp").text();
        const whatsapp_phone = "919867001303";
        const dynamicUserData = buildDynamicLines(orderData, [
            'package',
            'selectedPackageName',
            'selectedPackageAmount',
            'email',
            'gameSlug'
        ]);
        const message = `
Hi Recharge Arena,
I want to place a game top-up order.
Game: ${gameName}
${dynamicUserData}
Package: ${orderData.selectedPackageName}
Amount: ${orderData.selectedPackageAmount}
Please assist.
`.trim();
        const whatsappUrl =
            "https://wa.me/" + whatsapp_phone + "?text=" + encodeURIComponent(message);
        whatsapp_button = `<a href="${whatsappUrl}" target="_blank" class="text-decoration-none btn btn-block my-4 btn-info shadow-0"> Click here to order on WhatsApp</a>`;
    }
    let name = "Rehan Idrisi";
    let email = "idrisi.rehan@gmail.com";
    let phone = "8655313973";
    name = email = phone = "";
    const currentURL = encodeURIComponent(window.location.href);
    const gooogleLink = `google-login.php?return=${currentURL}`;
    return `
    <div class="mb-3">
      <label for="guest_name" class="form-label text-light">Name</label>
      <input type="text" id="guest_name" class="form-control rounded-0" required value='${name}'>
    </div>
    <div class="mb-3">
      <label for="guest_email" class="form-label text-light">Email Address</label>
      <input type="email" id="guest_email" class="form-control rounded-0" required value='${email}'>
      <div class="form-text text-secondary small">
        We'll send your OTP and order details to this email.
      </div>
    </div>
    <div class="mb-3">
      <label for="guest_phone" class="form-label text-light">Phone Number</label>
      <input maxlength="10" type="tel" id="guest_phone" class="form-control rounded-0" required value='${phone}'>
    </div>
    <div class="form-check mb-4">
      <input class="form-check-input" type="checkbox" id="is_18plus">
      <label class="form-check-label text-sm text-light" for="is_18plus">
        I confirm that I am 18 years of age or older
      </label>
    </div>
    <hr class="border-secondary my-3">
    <div class="d-flex mb-4 w-100 gap-2">
      <button id="customConfirmBtn" class="btn btn-light text-dark fw-semibold flex-grow-1" style="flex-basis:65%;" disabled>
        Continue as Guest
      </button>
      <button id="swalCloseBtn" type="button" class="btn btn-outline-light fw-semibold" style="flex-basis:35%;">
        Cancel
      </button>
    </div>
${whatsapp_button}
    <p class="text-light mb-2">Already have an account?</p>
    <div class="d-flex flex-column gap-2">
      <a href="login" class="btn btn-outline-light w-100"><i class="fas fa-sign-in-alt me-2"></i> Login</a>
      <a href='${gooogleLink}' class="btn btn-danger w-100"><i class="fab fa-google me-2"></i> Login with Google</a>
      <a href="register" class="btn btn-outline-info w-100"><i class="fas fa-user-plus me-2"></i> Register</a>
    </div>`;
}
// ===============================================
// 🔹 OTP MODAL & VERIFICATION FLOW
// ===============================================
function openOTPModal(message, guestEmail) {
    Swal.fire({
        title: "Verification Required",
        html: `
      <p>${message}</p>
      <div class="mb-3 text-start">
        <label for="otpInput" class="form-label">Enter OTP</label>
        <input id="otpInput" type="text" class="form-control" maxlength="6" placeholder="123456">
      </div>`,
        showCancelButton: true,
        confirmButtonText: "Verify OTP",
        cancelButtonText: "Cancel",
        preConfirm: () => {
            const otp = $("#otpInput").val().trim();
            if (!/^[0-9]{4,6}$/.test(otp)) {
                Swal.showValidationMessage("Please enter a valid OTP");
                return false;
            }
            return otp;
        },
    }).then((result) => {
        if (result.isConfirmed) verifyOTP(result.value, guestEmail);
    });
}
function verifyOTP(otp, guestEmail) {
    const userData = collectFormData(".username-verify");
    $.ajax({
        url: "required/gamison",
        method: "POST",
        dataType: "json",
        data: { otp: otp, guestEmail: guestEmail, ...userData },
        beforeSend: function () {
            Swal.fire({
                title: "Verifying OTP...",
                text: "Please wait a moment.",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });
        },
        success: function (response) {
            Swal.close();
            if (response.success && response.paymentUrl) {
                Swal.fire({
                    icon: "success",
                    title: "OTP Verified!",
                    text: "Redirecting to payment...",
                    showConfirmButton: false,
                    timer: 1800,
                    willClose: () => {
                        window.location.href = response.paymentUrl;
                    },
                });
            } else if (response.success && response.orderNumber) {
                Swal.fire({
                    icon: "success",
                    title: "Order Placed",
                    html: `Order ID: <strong>${response.orderNumber}</strong>`,
                    confirmButtonText: "View Orders",
                }).then(() => (window.location.href = "orders"));
            } else {
                showSwal(
                    "error",
                    "Verification Failed",
                    response.message || "Invalid or expired OTP.",
                );
            }
        },
        error: function () {
            showSwal(
                "error",
                "Server Error",
                "Something went wrong while verifying OTP.",
            );
        },
    });
}
// ===============================================
// 🔹 UTILITY FUNCTIONS
// ===============================================
function showSwal(icon, title, text) {
    Swal.fire({ icon, title, text });
}
function collectFormData(selector) {
    const data = {};
    $(selector).each(function () {
        const name = $(this).attr("name");
        const value = $(this).val() ? $(this).val().trim() : "";
        if (name) data[name] = value;
    });
    return data;
}
function isFormComplete(data) {
    return Object.values(data).every((v) => v !== "");
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function handleOrderResponse(response) {
    if (response.success && response.paymentUrl) {
        window.location.href = response.paymentUrl;
    }
    else if (response.success && response.session_id) {
        const paymentSDK = new EKQR({
            sessionId: response.session_id,
            callbacks: {
                onSuccess: function (data) {
                    if (!data || !data.client_txn_id) {
                        console.error("Invalid success response", data);
                        return;
                    }
                    const orderNumber = encodeURIComponent(data.client_txn_id);
                    window.location.href = "payment-callback?orderNumber=" + orderNumber;
                },
                onError: function (error) {
                    console.log("<pre>" + JSON.stringify(error, null, 2) + "</pre>");
                },
                onCancelled: function (data) {
                    console.log("<pre>" + JSON.stringify(data, null, 2) + "</pre>");
                }
            }
        });
        paymentSDK.pay();
    } else if (response.success && response.orderNumber) {
        Swal.fire({
            icon: "success",
            title: "Order Placed",
            html: `Order ID: <strong>${response.orderNumber}</strong>`,
            confirmButtonText: "View Orders",
        }).then(() => (window.location.href = "orders"));
    } else {
        showSwal(
            "error",
            "Order Failed",
            response.message || "Order failed. Please try again.",
        );
    }
}
function toSentenceCase(key) {
    return key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}
function buildDynamicLines(data, exclude = []) {
    return Object.entries(data)
        .filter(
            ([key, val]) =>
                !exclude.includes(key) &&
                val !== null &&
                val !== undefined &&
                val !== "",
        )
        .map(([key, val]) => `${toSentenceCase(key)}: ${val}`)
        .join("\n");
}
$("#loggedInUserWhatsappOrder").on("click", function () {
    buildOrderData(function (orderData) {
        const gameName = $("#gameNameForWhatsapp").text().trim();
        const whatsapp_phone = "919867001303";
        const dynamicUserData = buildDynamicLines(orderData, [
            "package",
            "selectedPackageName",
            "selectedPackageAmount",
            "email",
            "gameSlug",
        ]);
        const message = `
Hi Recharge Arena,
I want to place a game top-up order.
Game: ${gameName}
${dynamicUserData}
Package: ${orderData.selectedPackageName}
Amount: ${orderData.selectedPackageAmount}
Please assist.
        `.trim();
        const whatsappUrl =
            "https://wa.me/" +
            whatsapp_phone +
            "?text=" +
            encodeURIComponent(message);
        window.open(whatsappUrl, "_blank");
    });
});
function buildOrderData(callback) {
    const userData = collectFormData(".username-verify");
    if (!isFormComplete(userData)) {
        showSwal(
            "info",
            "Incomplete Details",
            "Please fill in all required fields.",
        );
        return;
    }
    verifyUsername(function (isVerified, verifiedData, userInfo) {
        if (!isVerified) {
            showSwal(
                "warning",
                "Verification Required",
                "Please check user ID details again.",
            );
            return;
        }
        const $pkg = $("[name='package_selection']:checked");
        if (!$pkg.length) {
            showSwal(
                "warning",
                "No Package Selected",
                "Please select a package before proceeding.",
            );
            return;
        }
        const selectedPackage = $pkg.val();
        const selectedPackageName = $pkg
            .closest(".col-6")
            .find("label .product-name")
            .text()
            .trim();
        const selectedPackageAmount = $pkg
            .closest(".col-6")
            .find("label small:eq(0)")
            .text()
            .trim();
        const email = $("#order-email").val().trim();
        if (email && !isValidEmail(email)) {
            showSwal(
                "warning",
                "Invalid Email",
                "Please enter a valid email address.",
            );
            return;
        }
        const orderData = {
            ...verifiedData,
            package: selectedPackage,
            selectedPackageName,
            selectedPackageAmount,
            email,
            username: userInfo.username,
            gameSlug: $("#game-id").val(),
        };
        callback(orderData);
    });
}
$('.information-button').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    let information = $(this).data('information');
    let name = $(this).data('product');
    try {
        information = decodeURIComponent(
            Array.prototype.map.call(atob(information), function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
        );
        $('#informationModal .info-title').text(name);
        $('#informationModal .info-content').html(information);
        let modal = new mdb.Modal(
            document.getElementById('informationModal')
        );
        modal.show();
    } catch (err) {
        console.error('Invalid Base64 data', err);
    }
});