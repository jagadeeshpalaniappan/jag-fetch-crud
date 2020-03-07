/* ###################### Util ###################### */

const random = () => Math.floor(Math.random() * 10);
const wait = (time) => {
  return new Promise((resolve, reject)=> {
    setTimeout(resolve, time);
  });
};


// handlePromise
async function hp(promise) {
  try {
    const res = await promise;
    // console.debug("res: received", res);
    return [null, res];
  } catch (err) {
    return [err];
  }
}

const jsonHttpCodes = new Set([200, 201]);

// handleFetch
async function hf(promise) {
  try {
    const res = await promise;
    // console.debug("res: received", res);

    let json = null;
    if (jsonHttpCodes.has(res.status)) {
      json = await res.json();
    }

    // console.debug("res: jsonParsed");
    return [null, json];
  } catch (err) {
    return [err];
  }
}

/* ###################### API ###################### */
const CONTACT_ENDPOINT = "https://jag-rest-api.firebaseapp.com/api/v1/contacts";

async function getAllContacts() {
  return hf(fetch(`${CONTACT_ENDPOINT}`));
}

async function getContactById(contactId) {
  return hf(fetch(`${CONTACT_ENDPOINT}/${contactId}`));
}

async function createContact(contact) {
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(contact)
  };

  return hf(fetch(`${CONTACT_ENDPOINT}`, options));
}

async function updateContact(contact) {
  const options = {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(contact)
  };

  return hf(fetch(`${CONTACT_ENDPOINT}/${contact.id}`, options));
}

async function deleteContact(contactId) {
  console.log("deleteContact:", contactId);
  return hp(fetch(`${CONTACT_ENDPOINT}/${contactId}`, { method: "DELETE" }));
}

/* ###################### Main ###################### */

async function main() {
  console.log("------START--------");

  const [err1, contacts] = await getAllContacts();
  if (err1) throw new Error("failed: getAllContact");
  console.log(`ALL_CONTACT :`, contacts);

  const [err2, contact] = await getContactById(contacts[3].id);
  if (err2) throw new Error("failed: getContactById");
  console.log(`GET_CONTACT: (id:${contact.id}) :`, contact);

  const newContact = {
    firstName: `jag-${random()}`,
    lastName: "developer",
    email: "11@g.com"
  };
  const [err3, newContactRes] = await createContact(newContact);
  if (err3) throw new Error("failed: createContact");
  console.log(`NEW_CONTACT: (id:${newContactRes.id}) :`, newContactRes);

  const updatedContact = JSON.parse(JSON.stringify(contact));
  updatedContact.lastName = `dev-${random()}`;

  const [err4, updatedContactRes] = await updateContact(updatedContact);
  if (err4) throw new Error("failed: updateContact");
  console.log(
    `UPDATED_CONTACT: (id:${updatedContact.id}) :`,
    updatedContactRes
  );
  

  const [err5, deleteContactRes] = await hf(deleteContact(contacts[0].id));
  if (err5) throw new Error("failed: deleteContact");

  const deleteAllPromises = [];
  // keep: 5 records and delete others
  for (let i = 1; i < contacts.length - 5; i++) {
    const delePromise = deleteContact(contacts[i].id);
    await wait(300);

    deleteAllPromises.push(delePromise);
  }

  const [err6, allDeletedContactRes] = await hp(Promise.all(deleteAllPromises));
  if (err6) throw new Error("failed: deleteAllPromises");
  console.log(`ALL_DELETED_CONTACT: httpStatus:`, allDeletedContactRes);

  console.log("------END--------");
}

try {
  main();
} catch (err) {
  console.err('ERR', err);
}
