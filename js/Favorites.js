import { GithubUser } from './GithubUser.js'

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.load();
    }

    load() {
        this.users = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.users));
    }

    async add(username) {
        try {
            const userExists = this.users.find(user => user.login.toLowerCase() === username.toLowerCase());
            if(userExists) {
                throw new Error('Utilizador já existe!');
            }

            const user = await GithubUser.search(username);

            if(user.login === undefined) {
                throw new Error('Utilizador não encontrado!');
            }

            this.users = [user, ...this.users]
            this.update();
        } catch(error) {
            alert(error.message);
        }
    }

    delete(user) {
        const filteredUsers = this.users
            .filter(entry => entry.login !== user.login);

        this.users = filteredUsers;
        this.update();
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root);

        this.tbody = this.root.querySelector('tbody');

        this.update();
        this.onAdd();
    }

    onAdd() {
        const addButton = this.root.querySelector('.add-btn');
        addButton.onclick = () => {
            const { value } = this.root.querySelector('#search-input');

            this.add(value);
        };
    }

    update() {
        this.removeAllTr();
        
        this.users.forEach((user) => {
            const row = this.createRow(user);
            row.querySelector('.remove').onclick = () => {
                const isOk = confirm("Tem certeza que deseja apagar esta linha?");
                if(isOk) {
                    this.delete(user);
                }
            }

            this.tbody.append(row);
        })

        this.save();
    }

    createRow(user) {
        const tr = document.createElement('tr');

        tr.innerHTML = `
        <tr>
            <td class="user">
                <img src="https://github.com/${user.login}.png" alt="Imagem de ${user.name}">
                <a href="https://github.com/${user.login}" target="_blank">
                    <p>${user.name}</p>
                    <span>${user.login}</span>
                </a>
            </td>
            <td class="repositories">${user.public_repos}</td>
            <td class="followers">${user.followers}</td>
            <td>
                <button class="remove">&times;</button>
            </td>
        </tr>
        `;

        return tr;
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach((row) => {
            row.remove();
        });
    }
}