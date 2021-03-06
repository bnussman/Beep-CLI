import * as r from 'rethinkdb';
import { Cursor } from 'rethinkdb';
import database from './utils/db';
import {sendNotification} from './utils/notifications';

export default class Queues {

    public async clear(id: string): Promise<void> {
        const cursor: Cursor = await r.table("queues").filter({ beeperid: id }).run((await database.getConn()));

        cursor.each(async (error: r.CursorError, queueEntry: any) => {
            if (error) console.error(error);

            if (!queueEntry.riderid) throw new Error("No rider id");
            
            //set each user's inQueueOfUserID to null so they are no longer in a beep
            await r.table('users').get(queueEntry.riderid).update({ inQueueOfUserID: null }).run((await database.getConn()));

            console.log("set inQueueOfUserID to null for", queueEntry.riderid);

            sendNotification(queueEntry.riderid, "You have been removed from a queue", "You have been removed from your beepers queue beacause they were inactive"); 
        });

        await r.table("queues").filter({ beeperid: id }).delete().run((await database.getConn()));

        //Set beeper's queue size to zero
        await r.table('users').get(id).update({ queueSize: 0, isBeeping: false }).run((await database.getConn()));
        console.log("Beeper", id, "queue has been cleared and is no longer beeping.");
    }    
}
