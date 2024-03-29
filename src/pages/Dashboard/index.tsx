import React, { useCallback, useEffect, useMemo, useState } from "react";
import { isToday, format, parseISO, isAfter } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import DayPicker, { DayModifiers } from "react-day-picker";
import 'react-day-picker/lib/style.css';
import { useAuth } from "../../hooks/auth";
import api from "../../services/apiClient";

import { FiClock, FiPower } from "react-icons/fi";
import { Container, Header, HeaderContent, Profile, Content, Schedule, NextAppointment, Calendar, Section, Appointment } from "./styles";

import logoImage from '../../assets/logo.svg';
import { Link } from "react-router-dom";

interface MonthAvailabilityItem {
    day: number;
    available: boolean;
}

interface GetAppointment {
    id: string;
    date: string;
    hourFormatted: string;
    user: {
        name: string;
        avatar_url: string;
    }
}

const Dashboard: React.FC = () => {

    const { signOut, user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthAvailability, setMonthAvailability] = useState<MonthAvailabilityItem[]>([]);
    const [appointments, setAppointments] = useState<GetAppointment[]>([]);

    const handleMonthChange = useCallback((month: Date) => {
        setCurrentMonth(month);
    }, [])

    const handleDateChange = useCallback((day: Date, modifiers: DayModifiers) => {
        if (modifiers.available && !modifiers.disabled) {
            setSelectedDate(day);
        }
    }, []);

    useEffect(() => {
        api.get(`/providers/${user.id}/month-availability`, {
            params: {
                year: currentMonth.getFullYear(),
                month: currentMonth.getMonth() + 1,
            }
        }).then(response => {
            setMonthAvailability(response.data);
        })

    }, [currentMonth, user.id]);

    useEffect(() => {
        api.get<GetAppointment[]>('/appointments/me', {
            params: {
                year: selectedDate.getFullYear(),
                month: selectedDate.getMonth() + 1,
                day: selectedDate.getDate(),
            }
        }).then(response => {
            const appointmentsFormatted = response.data.map(appointment => {
                return {
                    ...appointment,
                    hourFormatted: format(parseISO(appointment.date), 'HH:mm'),
                }
            })
            setAppointments(appointmentsFormatted)
        });

    }, [selectedDate])

    const disabledDays = useMemo(() => {
        const dates = monthAvailability.filter(monthDay => monthDay.available === false)
            .map(monthDays => {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                return new Date(year, month, monthDays.day)
            })

        return dates;

    }, [currentMonth, monthAvailability])

    const selectedDateAsText = useMemo(() => {
        return format(selectedDate, "'Dia' dd 'de' MMMM", {
            locale: ptBR,
        })
    }, [selectedDate]);

    const isTodayVerify = useMemo(() => {
        return isToday(selectedDate)
    }, [selectedDate]);

    const selectWeekDay = useMemo(() => {

        let stringWeekDay = format(selectedDate, 'cccc', { locale: ptBR, })

        let firstStringWeekDayUppercase = stringWeekDay[0].toUpperCase() + stringWeekDay.slice(1);

        return firstStringWeekDayUppercase

    }, [selectedDate]);

    const morningAppointments = useMemo(() => {
        return appointments.filter(appointment => {
            return parseISO(appointment.date).getHours() < 12;
        })
    }, [appointments]);

    const afternoonAppointments = useMemo(() => {
        return appointments.filter(appointment => {
            return parseISO(appointment.date).getHours() >= 12;
        })
    }, [appointments]);

    const nextAppointments = useMemo(() => {
        return appointments.find(appointment => {
            return isAfter(parseISO(appointment.date), new Date());
        })
    }, [appointments]);

    return (
        <Container>
            <Header>
                <HeaderContent>
                    <img src={logoImage} alt='Gobarber' />
                    <Profile>
                        <img src={user.avatar_url} alt={user.name} />
                        <div>
                            <span>Bem vindo</span>
                            <Link to={'/profile'}><strong>{user.name}</strong></Link>
                        </div>
                    </Profile>

                    <button type="button" onClick={signOut}>
                        <FiPower />
                    </button>
                </HeaderContent >
            </Header>
            <Content>
                <Schedule isTodayVerify={isTodayVerify}>
                    <h1>Horarios agendados</h1>
                    <p>
                        <span>{isTodayVerify && 'Hoje'} </span>
                        <span>{selectedDateAsText}</span>
                        <span>{selectWeekDay}</span>
                    </p>
                    {isToday(selectedDate) && nextAppointments && (
                        <NextAppointment>
                            <strong>Atendimento a seguir</strong>
                            <div>
                                <img src={nextAppointments.user.avatar_url} alt={nextAppointments.user.name} />

                                <strong>{nextAppointments.user.name}</strong>
                                <span>
                                    <FiClock />
                                    {nextAppointments.hourFormatted}
                                </span>
                            </div>
                        </NextAppointment>
                    )}

                    <Section>
                        <strong>Manhã</strong>
                        {morningAppointments.length === 0 && (
                            <p>Nenhum agendamento neste período</p>
                        )}

                        {morningAppointments.map((morningAppointment) => {
                            return (
                                <Appointment key={morningAppointment.id}>
                                    <span>
                                        <FiClock />
                                        {morningAppointment.hourFormatted}
                                    </span>
                                    <div>
                                        <img src={morningAppointment.user.avatar_url} alt={morningAppointment.user.name} />

                                        <strong>{morningAppointment.user.name}</strong>
                                    </div>
                                </Appointment>
                            )
                        })}
                    </Section>

                    <Section>
                        <strong>Tarde</strong>

                        {afternoonAppointments.length === 0 && (
                            <p>Nenhum agendamento neste período</p>
                        )}

                        {afternoonAppointments.map((afternoonAppointment) => {
                            return (
                                <Appointment key={afternoonAppointment.id}>
                                    <span>
                                        <FiClock />
                                        {afternoonAppointment.hourFormatted}
                                    </span>
                                    <div>
                                        <img src={afternoonAppointment.user.avatar_url} alt={afternoonAppointment.user.name} />

                                        <strong>{afternoonAppointment.user.name}</strong>
                                    </div>
                                </Appointment>
                            )
                        })}
                    </Section>
                </Schedule>
                <Calendar>
                    <DayPicker
                        weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
                        fromMonth={new Date}
                        disabledDays={[{ daysOfWeek: [0, 6] }, ...disabledDays]}
                        modifiers={{
                            available: { daysOfWeek: [1, 2, 3, 4, 5] }
                        }}
                        onMonthChange={handleMonthChange}
                        selectedDays={selectedDate}
                        onDayClick={handleDateChange}
                        months={[
                            'Janeiro',
                            'Fevereiro',
                            'Março',
                            'Abril',
                            'Maio',
                            'Junho',
                            'Julho',
                            'Agosto',
                            'Setembro',
                            'Outubro',
                            'Novembro',
                            'Dezembro',
                        ]}
                    />
                </Calendar>
            </Content>
        </Container>
    )
}

export default Dashboard;

