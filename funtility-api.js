class FuntilityAPI
{
    constructor()
    {
        this.getQuerySessionToken()
        this.sessionToken = this.getLocalSessionToken()
    }

    getQuerySessionToken()
    {
        const search = window.location.search.substring(1)
        if (search != '') {
            search.split('&').forEach(n => {
                let param = n.split('=')
                if (param[0] == 'jwt'){
                    localStorage.setItem('funtilitySessionToken',param[1])
                }
            })
        }
    }

    getLocalSessionToken()
    {
        let s = localStorage.getItem('funtilitySessionToken')
        if (!s)
        {
            s = ''
            localStorage.setItem('funtilitySessionToken',s)
        }
        return s
    }

    register(funtilityUserAccount)
    {
        fetch()
    }

    login(form)
    {

    }

    getInit(method, body = {})
    {
        return {
            method: method,
            body: body,
            headers: getHeaders(),
            mode: 'cors'
        }
    }

    getHeaders()
    {
        let result = new Headers()
        result.append('Authorization', `bearer ${this.getLocalSessionToken()}`);
    }
}

class FuntilityUserAccount
{
    constructor(data = {})
    {
        this.id = data.hasOwnProperty('id') ? data.Id : null
        this.userName = data.hasOwnProperty('userName') ? data.Id : "Guest"
        this.password = data.hasOwnProperty('password') ? data.Id : null
        this.email = data.hasOwnProperty('email') ? data.Id : null
        this.createDate = data.hasOwnProperty('createDate') ? data.Id : null
    }
}