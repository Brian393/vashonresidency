<template>
  <div>
    <v-card>
      <!-- /search -->
      <v-card-title> User List </v-card-title>

      <div class="d-flex flex-row">
        <div class="flex-grow-1 pa-2">
          <v-btn @click="registerNewUser" class="lighten-1" :color="color" dark>
            New User
            <v-icon right dark>add</v-icon>
          </v-btn>
        </div>
        <div class="flex-grow-1 pa-2">
          <v-btn :disabled="true" @click="manageRoles" class="float-right" :color="color" dark>
            Manage Roles <v-icon right dark>supervisor_account</v-icon>
          </v-btn>
          <v-btn @click="managePermissions" :disabled="true" class="float-right mr-2" :color="color" dark>
            Manage Permissions <v-icon right dark>vpn_key</v-icon>
          </v-btn>
        </div>

        <v-spacer></v-spacer>
        <v-text-field
          class="mr-3"
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </div>

      <v-progress-linear :active="loading" indeterminate :color="color"></v-progress-linear>
      <!-- data table -->
      <v-data-table
        hide-default-header
        :headers="headers"
        :search="search"
        :items-per-page="10"
        :items="filteredUser"
        class="elevation-1"
      >
        <template v-slot:header="{props: {headers}}">
          <thead>
            <tr>
              <th v-for="header in headers" :key="header.text">
                <div v-if="header.value == 'firstName'" :class="`text-${header.align}`">
                  <v-icon>person</v-icon> {{ header.text }}
                </div>
                <div v-else-if="header.value == 'lastName'" :class="`text-${header.align}`">
                  <v-icon>person</v-icon> {{ header.text }}
                </div>

                <div v-else-if="header.value == 'userName'" :class="`text-${header.align}`">
                  <v-icon>person</v-icon> {{ header.text }}
                </div>

                <div v-else-if="header.value == 'email'" :class="`text-${header.align}`">
                  <v-icon>email</v-icon> {{ header.text }}
                </div>

                <div v-else-if="header.value == 'relatedRoleID'" :class="`text-${header.align}`">
                  <v-icon>supervisor_account</v-icon> {{ header.text }}
                </div>

                <div v-else :class="`text-${header.align}`">
                  {{ header.text }}
                </div>
              </th>
            </tr>
          </thead>
        </template>
        <template v-slot:body="{items}">
          <tbody>
            <tr v-for="user in items" :key="user.userID">
              <td>{{ user.firstName || '---' }}</td>
              <td>{{ user.lastName || '---' }}</td>
              <td>{{ user.userName }}</td>
              <td>{{ user.email }}</td>

              <td>
                <v-chip outlined>
                  {{ roles[user.relatedRoleID] || user.relatedRoleID || 'No role' }}
                </v-chip>
              </td>
              <td>
                <div>
                  <v-tooltip top>
                    <template v-slot:activator="{on}">
                      <v-btn v-on="on" @click="editUser(user)" class="ma-1" small outlined icon color="info">
                        <v-icon small>edit</v-icon>
                      </v-btn>
                    </template>
                    <span>Edit User Profile</span></v-tooltip
                  >
                  <v-tooltip top>
                    <template v-slot:activator="{on}">
                      <v-btn v-on="on" @click="changePassword(user)" class="ma-1" small outlined icon color="info">
                        <v-icon small>lock</v-icon>
                      </v-btn>
                    </template>
                    <span>Change password</span></v-tooltip
                  >
                  <v-tooltip top>
                    <template v-slot:activator="{on}">
                      <v-btn v-on="on" @click="trash(user)" class="ma-1" small outlined icon :color="color">
                        <v-icon small>delete</v-icon>
                      </v-btn>
                    </template>
                    <span>Delete User</span></v-tooltip
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>

      <v-divider />

      <user-delete ref="confirm"></user-delete>
      <user-form-dialog ref="userForm" :color="color"></user-form-dialog>
    </v-card>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex';

import UserDelete from './UserDelete.vue';
import UserFormDialog from './UserForm.vue';

export default {
  data() {
    return {
      headers: [
        {
          text: 'First Name',
          value: 'firstName',
          align: 'left',
          sortable: false,
        },
        {
          text: 'Last Name',
          value: 'lastName',
          align: 'left',
          sortable: false,
        },
        {
          text: 'Username',
          value: 'userName',
          align: 'left',
          sortable: false,
        },
        {
          text: 'Email',
          value: 'email',
          align: 'left',
          sortable: false,
        },
        {
          text: 'Roles',
          value: 'relatedRoleID',
          align: 'left',
          sortable: false,
        },
        {
          text: 'Action',
          value: false,
          align: 'left',
          sortable: false,
        },
      ],
      search: '',
      loading: false,
      roles: {
        1: 'Admin User',
        2: 'Regular User',
        3: 'Guest User',
      },
      color: this.$appConfig.app.color.primary,
    };
  },
  components: {
    'user-delete': UserDelete,
    'user-form-dialog': UserFormDialog,
  },
  computed: {
    ...mapGetters('auth', {
      users: 'users',
      loggedUser: 'loggedUser',
    }),
    // Users array without the logged user
    filteredUser() {
      return this.users.filter(user => user.userID !== this.loggedUser.user.userID);
    },
  },
  mounted() {
    this.$store.dispatch('auth/getUsers');
  },
  methods: {
    ...mapMutations('map', {
      toggleSnackbar: 'TOGGLE_SNACKBAR',
    }),
    trash(user) {
      this.$refs.confirm
        .open('Confirm Delete', `Delete User ${user.userName} ?`, 'Yes', 'No', {
          color: this.color,
        })
        .then(confirm => {
          if (confirm.deleteUser === true) {
            // eslint-disable-next-line no-param-reassign
            user.deletePosts = confirm.deletePosts;
            this.loading = true;
            this.$store.dispatch('auth/deleteUser', user).then(
              () => {
                this.loading = false;
                this.toggleSnackbar({
                  type: 'success',
                  message: 'User deleted successfully',
                  state: true,
                  timeout: 2000,
                });
                this.$store.dispatch('auth/getUsers');
              },
              () => {
                this.loading = false;
                this.toggleSnackbar({
                  type: 'error',
                  message: "Can't delete user",
                  state: true,
                  timeout: 2000,
                });
              }
            );
          }
        });
    },

    registerNewUser() {
      this.$refs.userForm.open('new', 'New User', 'Save', 'Cancel', {
        color: this.color,
      });
    },
    editUser(user) {
      this.$refs.userForm.open(
        'update',
        'Update User',
        'Update',
        'Cancel',
        {
          color: this.color,
          icon: 'edit',
        },
        user
      );
    },
    changePassword(user) {
      this.$refs.userForm.open(
        'updatePassword',
        'Change password',
        'Save',
        'Cancel',
        {
          color: this.color,
          icon: 'lock',
        },
        user
      );
    },
    manageRoles() {},
    loadRoles() {},
    managePermissions() {},
  },
};
</script>
