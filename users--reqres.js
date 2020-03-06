/* ###################### Util ###################### */

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

// handleFetch
async function hf(promise) {
  try {
    const res = await promise;
    // console.debug("res: received", res);
    const json = await res.json();
    // console.debug("res: jsonParsed");
    return [null, json];
  } catch (err) {
    return [err];
  }
}

/* ###################### API ###################### */
const USERS_ENDPOINT = "https://reqres.in/api/users";

async function getAllUsers() {
  return hf(fetch(`${USERS_ENDPOINT}?page=2`));
}

async function getUserById(userId) {
  return hf(fetch(`${USERS_ENDPOINT}/${userId}`));
}

async function createUser(user) {
  return hf(fetch(`${USERS_ENDPOINT}`, { method: "POST", body: user }));
}

async function updateUser(user) {
  return hf(
    fetch(`${USERS_ENDPOINT}/${user.id}`, { method: "PUT", body: user })
  );
}

async function deleteUser(userId) {
  return hp(fetch(`${USERS_ENDPOINT}/${userId}`, { method: "DELETE" }));
}

/* ###################### Main ###################### */

async function main() {
  console.log("------START--------");

  const [err1, users] = await getAllUsers();
  if (err1) throw new Error("failed: getAllUser");
  console.log(`ALL_USERS: (page:${users.page}) :`, users);

  const [err2, user] = await getUserById(users.data[0].id);
  if (err2) throw new Error("failed: getUserById");
  console.log(user);
  console.log(`GET_USER: (id:${user.data.id}) :`, users);

  const newUser = { name: "jag", job: "developer" };
  const [err3, newUserRes] = await createUser(newUser);
  if (err3) throw new Error("failed: createUser");
  console.log(`NEW_USER: (id:${newUserRes.id}) :`, newUserRes);

  const updatedUser = { id: 5, name: "jag", job: "developer" };
  const [err4, updatedUserRes] = await updateUser(newUser);
  if (err4) throw new Error("failed: updateUser");
  console.log(`UPDATED_USER: (id:${updatedUser.id}) :`, updatedUserRes);


  const [err5, deletedUserRes] = await deleteUser(5);
  if (err5) throw new Error("failed: deleteUser");
  console.log(`DELETED_USER: (id:5) httpStatus:`, deletedUserRes.status);

  console.log("------END--------");
}

main();
