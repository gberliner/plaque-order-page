CREATE OR REPLACE FUNCTION ordergrouping()
 RETURNS void
AS $function$
-- this function assigns groups to unassigned customer orders
	DECLARE
		cur_orders CURSOR FOR
		SELECT * FROM custorders WHERE grouporderid IS null;
		order_record record;
		orders_to_process integer;
		orders_done_processing integer;
		
		BEGIN
			SELECT COUNT(*) INTO orders_to_process FROM custorders WHERE grouporderid IS NULL;
			open cur_orders;
			orders_done_processing := 0;
			loop
			<<grouporders>>
			DECLARE
				ralength integer;
				ralengthplusone integer;
				lastorderidx integer;
				lastgroupidx integer;
				group_record record;
				cur_groups CURSOR FOR
				SELECT * FROM groupedorders ORDER BY array_length(ordergroup,1) for update;
				BEGIN
					OPEN cur_groups;
					loop
						FETCH cur_orders INTO order_record;
						if not found then
							return; -- ALL done!
						end if;
						orders_done_processing := orders_done_processing + 1;
 						FETCH cur_groups INTO group_record;
 						IF NOT FOUND THEN
 							CLOSE cur_groups;
 							-- figure out whether enough orders
 							-- are left to bother making a new group
 							IF orders_to_process - orders_done_processing >= 3 then
 								lastorderidx = order_record.id;
 								select max(id) into lastgroupidx from groupedorders;
 								if lastgroupidx is null then
 									lastgroupidx := 1;
 								 	INSERT INTO groupedorders (id,ordergroup) values(lastgroupidx, array[lastorderidx]);
 								else
 								 	INSERT INTO groupedorders (ordergroup) values(array[lastorderidx]); 								
 								end if;
 							 	update custorders set grouporderid=lastgroupidx where current of cur_orders;
 							END IF;
 							-- rewind cur_groups cursor
 							exit grouporders;
 						END IF;
						lastorderidx = order_record.id;
						lastgroupidx := group_record.id;
						ralength := array_length(group_record.ordergroup,1);
						if ralength=null then
							ralength=0;
						end if;
						UPDATE groupedorders SET ordergroup[ralength+1]=lastorderidx WHERE CURRENT OF cur_groups;
						UPDATE custorders SET grouporderid=lastgroupidx WHERE CURRENT OF cur_orders;
					END loop;
				end;
			end loop;
		END
$function$ LANGUAGE plpgsql;
