class User {
    constructor(name, email, password, createdAt, cpf, perfil = 'CLIENTE') {
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.cpf = cpf;
        this.perfil = perfil;
    }
}

export { User };
