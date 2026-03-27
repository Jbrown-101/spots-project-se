import "./index.css";
import {
  enableValidation,
  resetValidation,
  disableButton,
  settings,
} from "../scripts/validation.js";
import { setButtonText } from "../utils/helper.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "e3d9dd0c-a281-4f11-b346-1a1aada93371",
    "Content-Type": "application/json",
  },
});

Promise.all([api.getUserInfo(), api.getInitialCards()])
  .then(([user, cards]) => {
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    document.querySelector(".profile__avatar").src = user.avatar;

    cards.forEach((item) => {
      const cardEl = getCardElement(item);
      cardsList.append(cardEl);
    });
  })
  .catch(console.error);

//Profile elements
const profileAvatar = document.querySelector(".profile__avatar");
const editProfileBtn = document.querySelector(".profile__edit-btn");
const newPostBtn = document.querySelector(".profile__add-btn");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

// List of modals, for setting overlay click listeners.
const modals = document.querySelectorAll(".modal");

// Edit form elements
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input",
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input",
);

// NewPost form elements
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newPostLinkInput = newPostModal.querySelector("#card-image-input");
const newPostCaptionInput = newPostModal.querySelector("#card-caption-input");
const newPostForm = newPostModal.querySelector(".modal__form");
const newPostSubmitBtn = newPostModal.querySelector(".modal__submit-btn");

// Avatar form elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

// Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector("#delete-form");
const deleteCancelBtn = deleteModal.querySelector(".modal__cancel-btn");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn");

let selectedCard, selectedCardId;

// Preview image popup elements
const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

// Variable that stores a DOM element- a reference to an element on the page
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

// NewPostSubmit
function handleNewPostSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);

  api
    .addCard({
      name: newPostCaptionInput.value,
      link: newPostLinkInput.value,
    })
    .then((newCardData) => {
      const cardEl = getCardElement(newCardData);
      cardsList.prepend(cardEl);
      newPostForm.reset();
      disableButton(newPostSubmitBtn, settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

newPostForm.addEventListener("submit", handleNewPostSubmit);

// HandleProfileSubmit
function handleProfileSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
      profileForm.reset();
      resetValidation(profileForm, validationConfig);
      disableButton(submitBtn, validationConfig);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

editProfileForm.addEventListener("submit", handleProfileSubmit);

// HandleAvatarSubmit
function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);

  api
    .editUserAvatar({
      avatar: avatarInput.value,
    })
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
      resetValidation(avatarForm, validationConfig);
      disableButton(submitBtn, validationConfig);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

avatarForm.addEventListener("submit", handleAvatarSubmit);

// HandleLike
function handleLike(evt, id) {
  const likeBtn = evt.target;
  const isLiked = likeBtn.classList.contains("card__like-button_active");

  api
    .handleLikeStatusCard(id, isLiked)
    .then((updatedCard) => {
      likeBtn.classList.toggle("card__like-button_active", updatedCard.isLiked);
    })
    .catch(console.error);
}

// HandleDeleteSubmit
function handleDeleteSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Delete", "Deleting...");

  api
    .deleteUserCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Delete", "Deleting...");
    });
}

deleteForm.addEventListener("submit", handleDeleteSubmit);

// AddEventListeners for (submit and click)
editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    settings,
  );
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

previewModalCloseBtn.addEventListener("click", function () {
  closeModal(previewModal);
});

avatarModalBtn.addEventListener("click", function () {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", function () {
  closeModal(avatarModal);
});

deleteModalCloseBtn.addEventListener("click", function () {
  closeModal(deleteModal);
});

deleteCancelBtn.addEventListener("click", function () {
  closeModal(deleteModal);
});
// End of all Listeners

// Other Functions
function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscape);
  if (modal === deleteModal) {
    selectedCard = null;
    selectedCardId = null;
  }
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

// Iterator
modals.forEach((modal) => {
  modal.addEventListener("click", (evt) => {
    if (evt.target === modal) {
      closeModal(modal);
    }
  });
});

// Captures all the data
function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-button");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-button");

  cardTitleEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  if (data.isLiked) {
    cardLikeBtnEl.classList.add("card__like-button_active");
  }

  cardLikeBtnEl.addEventListener("click", (evt) => handleLike(evt, data._id));

  cardDeleteBtnEl.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id),
  );

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

enableValidation(settings);
