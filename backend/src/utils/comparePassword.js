import bcrypt from "bcrypt";

const comparePassword = async (enterdPassword,hashedPassword) =>{
    return await bcrypt.compare(enterdPassword,hashedPassword);
}

export default comparePassword;