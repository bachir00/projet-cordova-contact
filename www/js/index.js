var selectedContact;
var favoriteContacts = []; 
var allContacts = []; 

// Fonction pour afficher les détails du contact
function showContactDetails(contactId) {
    navigator.contacts.find(["*"], function(contacts) {
        selectedContact = contacts.find(contact => contact.id == contactId);
        if (selectedContact) {
            $('#contactName').text(selectedContact.displayName);
            $('#contactPhone').text(selectedContact.phoneNumbers[0].value);
            $('#contactType').text(selectedContact.phoneNumbers[0].type);
            $('#contactImg').attr('src', 'img/contact1.png'); // Vous pouvez ajouter une logique pour afficher des images spécifiques si nécessaire
            $.mobile.changePage("#contactDetailPage");
        }
    }, function(error) {
        alert("Erreur lors de la récupération des détails du contact : " + error.code);
    }, { filter: "", multiple: true });
}

// Fonction pour afficher la page de modification du contact
function showEditContactPage() {
    $('#editContactName').val(selectedContact.displayName);
    $('#editContactPhone').val(selectedContact.phoneNumbers[0].value);
    $('#editContactType').val(selectedContact.phoneNumbers[0].type);
    $.mobile.changePage("#editContactPage");
}

// Fonction pour modifier le contact
function editContact() {
    selectedContact.displayName = $('#editContactName').val();
    selectedContact.phoneNumbers[0].value = $('#editContactPhone').val();
    selectedContact.phoneNumbers[0].type = $('#editContactType').val();

    selectedContact.save(function(contact) {
        console.log("Contact modifié : ", contact);
        alert("Contact modifié avec succès !");
        fetchContacts();
        $.mobile.changePage("#contactDetailPage");
    }, function(error) {
        console.log("Erreur lors de la modification du contact : ", error);
        alert("Erreur lors de la modification du contact : " + error.code);
    });
}

// Fonction pour récupérer les contacts
function fetchContacts() {
    var options = new ContactFindOptions();
    options.filter = ""; 
    options.multiple = true;
    var fields = ["displayName", "phoneNumbers"];

    navigator.contacts.find(fields, function(contacts) {
        console.log("Contacts récupérés : ", contacts);
        allContacts = contacts;
        if (contacts.length > 0) {
            document.getElementById('contactCount').innerText = contacts.length + ' contacts';
            onContactsSuccess(contacts);
        } else {
            displayNoContactsMessage();
        }
    }, function(error) {
        console.log("Erreur lors de la récupération des contacts : ", error);
        onContactsError(error);
    }, options);
}

// Fonction pour afficher les contacts récupérés
function onContactsSuccess(contacts) {
    console.log("Nombre de contacts récupérés : ", contacts.length);
    var contactList = $('#contactList');
    contactList.empty();

    contacts.forEach(function(contact) {
        if (contact.displayName && contact.phoneNumbers) {
            var contactName = contact.displayName;
            var contactPhone = contact.phoneNumbers[0].value; 

            console.log("Ajout du contact : ", contactName, contactPhone);
            contactList.append(
                '<li>' +
                '<a href="#" class="contact-link" data-contact-id="' + contact.id + '">' +
                '<img src="img/contact1.png" class="contact-img">' +
                '<h2>' + contactName + '</h2>' +
                '<p>' + contactPhone + '</p>' +
                '</a></li>'
            );
        }
    });

    contactList.listview('refresh');
}

// Fonction pour gérer les erreurs de récupération des contacts
function onContactsError(error) {
    alert("Erreur lors de la récupération des contacts : " + error.code);
}

// Fonction pour afficher un message si aucun contact n'est disponible
function displayNoContactsMessage() {
    var contactList = $('#contactList');
    contactList.empty();
    contactList.append('<li>Aucun contact disponible</li>');
    contactList.listview('refresh');
}

// Fonction pour ajouter un contact
function addContact() {
    var newContactName = $('#newContactName').val();
    var newContactPhone = $('#newContactPhone').val();
    var newContactType = $('#newContactType').val();

    var newContact = navigator.contacts.create();
    newContact.displayName = newContactName;

    var phoneNumbers = [];
    phoneNumbers[0] = new ContactField(newContactType, newContactPhone, true);
    newContact.phoneNumbers = phoneNumbers;

    newContact.save(function(contact) {
        console.log("Contact ajouté : ", contact);
        alert("Contact ajouté avec succès !");
        $('#addContactForm')[0].reset();
        fetchContacts();
        $.mobile.changePage("#contactListPage");
    }, function(error) {
        console.log("Erreur lors de l'ajout du contact : ", error);
        alert("Erreur lors de l'ajout du contact : " + error.code);
    });
}

// Fonction pour supprimer le contact
function deleteContact() {
    selectedContact.remove(function() {
        console.log("Contact supprimé avec succès");
        alert("Contact supprimé avec succès !");
        fetchContacts();
        $.mobile.changePage("#contactListPage");
    }, function(error) {
        console.error("Erreur lors de la suppression du contact : ", error);
        alert("Erreur lors de la suppression du contact : " + error.code);
    });
}

// Fonction pour ajouter/retirer le contact des favoris
function toggleFavoriteContact() {
    var contactId = selectedContact.id;
    var index = favoriteContacts.indexOf(contactId);
    
    if (index === -1) {
        favoriteContacts.push(contactId);
        alert("Contact ajouté aux favoris !");
    } else {
        favoriteContacts.splice(index, 1);
        alert("Contact retiré des favoris !");
    }
}

// Fonction pour afficher les contacts favoris
function showFavoriteContacts() {
    var favoriteContactList = $('#favoriteContactList');
    favoriteContactList.empty();

    favoriteContacts.forEach(function(contactId) {
        var contact = allContacts.find(function(c) {
            return c.id === contactId;
        });

        if (contact) {
            favoriteContactList.append(
                '<li>' +
                '<a href="#" class="contact-link" data-contact-id="' + contact.id + '">' +
                '<img src="img/contact1.png" class="contact-img">' +
                '<h2>' + contact.displayName + '</h2>' +
                '<p>' + contact.phoneNumbers[0].value + '</p>' +
                '</a></li>'
            );
        }
    });

    favoriteContactList.listview('refresh');
}

// Gestion de l'événement clic sur le bouton "Favoris" de la page de détail des contacts
$(document).on('click', '#favoriteContactButton', function() {
    toggleFavoriteContact();
});

// Gestion de l'événement clic sur le bouton pour afficher les favoris
$(document).on('pagebeforeshow', '#favoriteContactsPage', function() {
    showFavoriteContacts();
});

// Initialisation de l'application
$(document).ready(function () {
    $('#addContactForm').on('submit', function (event) {
        event.preventDefault();
        addContact();
    });

    $('#editContactForm').on('submit', function (event) {
        event.preventDefault();
        editContact();
    });

    $(document).on('click', '.contact-link', function () {
        var contactId = $(this).data('contact-id');
        showContactDetails(contactId);
    });

    $('#editContactButton').on('click', function () {
        showEditContactPage();
    });
});

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Device is ready');
    fetchContacts();
}
//////////////////////
// Fonction pour supprimer le contact
function deleteContact() {
    selectedContact.remove(function() {
        console.log("Contact supprimé avec succès");
        alert("Contact supprimé avec succès !");
        fetchContacts();
        $.mobile.changePage("#contactListPage");
    }, function(error) {
        console.error("Erreur lors de la suppression du contact : ", error);
        alert("Erreur lors de la suppression du contact : " + error.code);
    });
}

$(document).on('click', '#deleteContactButton', function() {
    if (confirm("Voulez-vous vraiment supprimer ce contact ?")) {
        deleteContact();
    }
});