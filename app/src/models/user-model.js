class User {
    constructor(name, password, createdAt, cpf, perfil = 'CLIENTE', emails = [], telefones = []) {
        this.name = name;
        this.password = password;
        this.createdAt = createdAt;
        this.cpf = cpf;
        this.perfil = perfil;
        this.emails = Array.isArray(emails) ? emails : [];
        this.telefones = Array.isArray(telefones) ? telefones : [];
        this.validateEmails();
        this.validateTelefones();
    }

    validateEmails() {
        const principaisEmails = this.emails.filter(email => email.is_primary);
        if (principaisEmails.length === 0) {
            throw new Error("É necessário ter ao menos um email definido como principal.");
        }
    }

    validateTelefones() {
        const principaisTelefones = this.telefones.filter(phone => phone.is_primary);
        if (principaisTelefones.length === 0) {
            throw new Error("É necessário ter ao menos um telefone definido como principal.");
        }
    }
}

export { User };
