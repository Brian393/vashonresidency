'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('_accounts', {
      accountID: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: Sequelize.STRING,
      planLevel: Sequelize.STRING,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('_accounts');
  }
};
