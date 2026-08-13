const oracledb = require("oracledb");
require("dotenv").config();

oracledb.initOracleClient({
    libDir: "C:\\oraclexe\\app\\oracle\\product\\11.2.0\\server\\bin"
});

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};

async function getConnection() {
    return await oracledb.getConnection(dbConfig);
}

module.exports = {
    getConnection,
    oracledb
};