-- Drop table

-- DROP TABLE public.custorders;

CREATE TABLE public.custorders (
	sqorderid varchar(80) NULL,
	custemail varchar(80) NULL,
	custaddr varchar(80) NULL,
	grouporderid int4 NULL,
	id serial NOT NULL,
	CONSTRAINT fk_custorders_groupedorders FOREIGN KEY (grouporderid) REFERENCES public.groupedorders(id)
);
-- Drop table

-- DROP TABLE public.groupedorders;

CREATE TABLE public.groupedorders (
	id serial NOT NULL,
	ordergroup _int4 NULL,
	CONSTRAINT groupedorders_pkey PRIMARY KEY (id)
);

-- Drop table

-- DROP TABLE public.salescatalog;

CREATE TABLE public.salescatalog (
	objectid varchar(80) NULL,
	"name" varchar(80) NULL,
	price int4 NULL
);

