import { BookData } from "../../types/bookData";
import { HttpResponse, StatusCode } from "../client/IHttpClient";
import { ShelfieHttpClient } from "../client/ShelfieHttpClient";

export class BookService {
    private client: ShelfieHttpClient;

    constructor() {
        this.client = new ShelfieHttpClient();
    }

    async isBookEnabled({ googleId }: BookData): Promise<HttpResponse<any>> {
        console.log(googleId);
        const base = `/api/mybooks/is-enabled/${googleId}`;

        const response = await this.client.get({ url: base });
        return response;
    }

    async postBookStatus({ googleId, bookStatus }: BookData): Promise<HttpResponse<any>> {
        const newStatus = (bookStatus ?? '').toUpperCase().replace(' ', '_');

        const base = `/api/mybooks/${googleId}/${newStatus}`;

        const response = await this.client.post({ url: base });
        return response;
    }

    async putBookStatus({ googleId, bookStatus }: BookData): Promise<HttpResponse<any>> {
        const base = `/api/mybooks/${googleId}/update/${bookStatus}`;

        const response = await this.client.put({ url: base });
        return response;
    }

    async updateBookStatus({ googleId, bookStatus }: BookData): Promise<HttpResponse<any>> {
        const formattedBookStatus = (bookStatus ?? '').toUpperCase().replace(' ', '_');
        const base = `/api/mybooks/${googleId}/update/${formattedBookStatus}`;

        if(bookStatus && bookStatus.includes('SELECIONAR')) {
            return {
                statusCode: StatusCode.BadRequest,
            };
        };

        const isEnabledResponse = await this.isBookEnabled({ googleId })
        console.log('isEnabled: ', isEnabledResponse); 
        // se retornar 200, o livro esta associado ao usuário, mesmo que desabilitado
        if (isEnabledResponse.statusCode === StatusCode.Ok) {
            const response = await this.client.put({ url: base });
            if (response.statusCode === StatusCode.Ok) {
                return {
                    ...response,
                    resolve: 'Status atualizado com sucesso',
                }
            } else {
                return {
                    ...response,
                    reject: 'Erro ao atualizar status',
                }
            }
        } // se não, o livro não esta associado ao usuário e pode ser feito post
        else {
            const response = await this.postBookStatus({ googleId, bookStatus });
            console.log('response post: ', response);
            if (response.statusCode === StatusCode.Created) {
                return {
                    ...response,
                    resolve: `Livro adicionado à sua estante como ${bookStatus}`,
                }
            } else {
                return {
                    ...response,
                    reject: 'Erro ao adicionar o livro na estante',
                }
            }
        }
    }

    async postProgression(data: BookData): Promise<HttpResponse<any>> {
        const base = `/api/reading`;

        const response = await this.client.post({
            url: base,
            body: data
        });

        if (response.statusCode === StatusCode.Created) {
            return {
                ...response,
                resolve: 'Progressão salva com sucesso!',
            };
        } else return {
            ...response,
            reject: 'Erro ao salvar progressão',
        }
    }

    async fetchBooksByUser(): Promise<HttpResponse<any>> {
        const base = '/api/mybooks';

        const response = await this.client.get({ url: base });

        if (response.statusCode === StatusCode.Ok) {
            return {
                statusCode: StatusCode.Ok,
                body: response.body,
                resolve: 'Sucesso ao buscar livros',
            }

        } else {
            return {
                ...response,
                reject: 'Erro ao buscar livros',
            };
        }
    }

    async fetchBooksByStatus(status: string): Promise<HttpResponse<any>> {
        const base = `/api/mybooks/status/${status}`;

        const response = await this.client.get({ url: base });

        if (response.statusCode === StatusCode.Ok) {
            return {
                statusCode: StatusCode.Ok,
                body: response.body,
                resolve: 'Sucesso ao buscar livros',
            }

        } else {
            return {
                ...response,
                reject: 'Erro ao buscar livros',
            };
        }
    }

    disableBook = async (myBooksId: string): Promise<HttpResponse<any>> => {
        const base = `/api/mybooks/${myBooksId}/disable`;

        const response = await this.client.put({ url: base });

        if (response.statusCode === StatusCode.Ok) {
            return {
                statusCode: StatusCode.Ok,
                resolve: 'Livro desativado com sucesso',
            }
        } else {
            return {
                ...response,
                reject: 'Erro ao desativar livro',
            }
        }
    }
}