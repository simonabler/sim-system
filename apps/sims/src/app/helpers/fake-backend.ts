import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { Customer, Article, Shoppingcart, Order } from '../models';


// array in local storage for registered users
let users = [
    {
        id: 1,
        username: 'mathe',
        password: '1',
        firstName: 'Mathias',
        lastName: 'Abler',
    },
    {
        id: 2,
        username: 'chello',
        password: '2',
        firstName: 'Christoph',
        lastName: 'SS',
    }
];

const customers: Customer[] = [
    new Customer({
        id: 1,
        firstName: 'Simon',
        lastName: 'Abler',
        email: 'simon.abler@gmail.com',
        companyName: 'ematric',
        phonePrivate: '06645223325',
        phoneCompany: '45455464',
        address: 'string',
        postcode: 'string',
        country: 'string',
        uid: 'string',
        customerDiscount: 0
    }),
    new Customer({
        id: 2,
        firstName: 'Mathias',
        lastName: 'abler',
        email: 'mathias.abler@gmail.com',
        companyName: 'Abler gmbh',
        phonePrivate: '06645223325',
        phoneCompany: '45455464',
        address: 'Grins 2c',
        postcode: '6335',
        country: 'Grins',
        uid: 'AT652232',
        customerDiscount: 0

    }),
];


let articles: any[] = [
    {
        id: 1,
        name: 'Schlauch',
        code: '555',
        supplier: 'abler',
        price: 3.0,
        stock: 10.98,
        description: 'Hydraulikschlauch',
        artNumber: 'ssllo',
        type: '49384.s',
        unit: 'm',
        imgPath: null
    },
    {
        id: 2,
        name: 'Ring-Schlauchnippen DN3',
        code: 'MM1000482741',
        supplier: 'Haberkorn',
        price: 15.9,
        stock: 100,
        description: 'Ring-Schlauchnippen DN3 \nDm. 8mm LW 4-5mm',
        artNumber: '8081.0300',
        type: 'T67168',
        unit: 'STK',
        imgPath: null
    },
    {
        id: 3,
        name: 'Furtz',
        code: 'MM1000482742',
        supplier: 'Haberkorn',
        price: 20.0,
        stock: 100,
        description: 'Volle Furz\nDm. 8mm LW 4-5mm',
        artNumber: '8081.0300',
        type: 'T67168',
        unit: 'STK',
        imgPath: null
    },
];

const inventur: any[] = [
    {
        id: 1,
        articleId: 1,
        amount: 1,
        diff: 1,
        create_date: '2020-03-20'
    },
];

const supply: any[] = [
    {
        id: 1,
        articleId: 1,
        amount: 1,
        create_date: '2020-03-20'
    },
];


const orderEntries: Order[] = [
    new Order({
        id: 1,
        article: new Article(articles[0]),
        amount: 3.0,
    }),
    new Order({
        id: 2,
        article: new Article(articles[1]),
        amount: 2.0,
    }),
    new Order({
        id: 3,
        article: new Article(articles[2]),
        amount: 8.0,
    }),
    new Order({
        id: 4,
        article: new Article(articles[1]),
        amount: 3.0,
    }),
];

const shoppingcarts: Shoppingcart[] = [
    new Shoppingcart({
        id: 1,
        customer: customers[0],
        orderEntries: orderEntries.slice(0, 3),
        state: 'open',
        updatedAt: new Date()
    }),
    new Shoppingcart({
        id: 2,
        customer: customers[1],
        orderEntries: orderEntries.slice(3, 4),
        state: 'open',
        updatedAt: new Date()
    }),
];



@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body, params } = request;

        console.log(url, method)

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown
            // (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users/register') && method === 'POST':
                    return register();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                case url.match(/\/users\/\d+$/) && method === 'DELETE':
                    return deleteUser();
                case url.endsWith('/customers') && method === 'GET':
                    return getCustomers();
                case url.match(/\/customers\/\d+$/) && method === 'GET':
                    return getCustomersId();
                case url.endsWith('/articles') && method === 'GET':
                    return getArticles();
                case url.endsWith('/articles') && method === 'POST':
                    return addArticle();
                case url.match(/\/articles\/\d+\/inventory$/) && method === 'POST':
                    return addArticleInventory(/\/articles\/(\d+)\/inventory$/);
                case url.match(/\/articles\/\d+$/) && method === 'DELETE':
                    return deleteArticle();

                case url.endsWith('/shoppingcart') && method === 'GET':
                    return getShoppingcart();
                case url.endsWith('/shoppingcart') && method === 'POST':
                    return addShoppingcart();

                case url.endsWith('/transaction') && method === 'GET':
                    return getArticles();
                case url.endsWith('/transaction') && method === 'POST':
                    return addArticle();

                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }
        }

        // route functions

        function authenticate() {
            const { username, password } = body;
            const user = users.find(x => x.username === username && x.password === password);
            if (!user) { return error('Username or password is incorrect'); }
            return ok({
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                token: 'fake-jwt-token',
            });
        }

        function register() {
            const user = body.user;

            if (users.find(x => x.username === user.username)) {
                return error('Username "' + user.username + '" is already taken');
            }

            user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));

            return ok();
        }

        function getUsers() {
            if (!isLoggedIn()) { return unauthorized(); }
            return ok(users);
        }

        function deleteUser() {
            if (!isLoggedIn()) { return unauthorized(); }

            users = users.filter(x => x.id !== idFromUrl());
            localStorage.setItem('users', JSON.stringify(users));
            return ok();
        }

        function getCustomers() {
            if (!isLoggedIn()) { return unauthorized(); }
            return ok({ customers });
        }

        function getCustomersId() {
            if (!isLoggedIn()) { return unauthorized(); }
            const customer = customers.find(x => x.id !== idFromUrl());
            if (customer) {
                return ok({ customer: customer });

            } else {
                return notFound();

            }
        }

        function getArticles() {
            if (!isLoggedIn()) { return unauthorized(); }


            if (params.has('code')) {
                const article = articles.find(a => a.code === params.get('code'));

                if (article) {
                    return ok({ article });
                } else {
                    return notFound();
                }
            }

            if (params.has('id')) {
                const article = articles.find(a => a.id === Number(params.get('id')));
                if (article) {
                    return ok({ article });
                } else {
                    return notFound();
                }
            }
            return ok({ articles: articles });
        }

        function addArticle() {
            if (!isLoggedIn()) { return unauthorized(); }
            const article = body.article;
            article['id'] = articles[articles.length - 1].id + 1;
            articles.push(article);
            return ok({ article });
        }

        function deleteArticle() {
            if (!isLoggedIn()) { return unauthorized(); }
            articles = articles.filter(x => x.id !== idFromUrl());
            return ok({});
        }
        function addArticleInventory(regex) {
            const article = articles.find(a => a.id === Number(url.match(regex)[1]));
            if (article) {
                article.stock = body.newStock;
                return ok({ article });
            } else {
                return notFound();
            }
        }

        function getShoppingcart() {
            if (!isLoggedIn()) { return unauthorized(); }
            if (params.has('customerId')) {
                const shoppingcart = shoppingcarts.find(a => a.customer.id === Number(params.get('customerId')));
                if (shoppingcart) {
                    return ok({ shoppingcart: shoppingcart });
                } else {
                    return notFound();
                }
            }
            return notFound();
        }

        function addShoppingcart() {
            if (!isLoggedIn()) { return unauthorized(); }
            /*
                  article,
          amount: formData.amount,
          customer: formData.customer */
            const article = articles.find(a => a.id === Number(body.article.id));
            const amount = Number(body.amount);
            const customer = customers.find(c => c.id === Number(body.customer.id));

            if (!article || !amount || !customer) {
                return notFound();
            }


            let cart = shoppingcarts.find(c => c.customer.id === customer.id && c.state === 'open');

            if (!cart) {
                cart = new Shoppingcart();
                cart.id = shoppingcarts[shoppingcarts.length - 1].id + 1;
                cart.customer = customer;
            }

            let order = cart.orderEntries.find(o => o.article.id === article.id);
            if (!order) {
                order = new Order();
                order.id = orderEntries[orderEntries.length - 1].id + 1;
                order.article = article;
                order.amount = 0;
                cart.orderEntries.push(order);
            }
            order.amount += amount;

            return ok({ shoppingcart: cart });
        }

        // helper functions

        function ok(Okbody?) {

            const bodyToSend = Object.assign({}, Okbody);
            bodyToSend['success'] = true;
            return of(new HttpResponse({ status: 200, body: JSON.parse(JSON.stringify(bodyToSend)) }));
        }

        function notFound() {
            return of(new HttpResponse({ status: 404, body: { success: false } }));
        }

        function error(message) {
            return throwError({ error: { message } });
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        function isLoggedIn() {
            // return headers.get('Authorization') === 'Bearer fake-jwt-token';
            return true;
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1], 10);
        }


    }











}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
